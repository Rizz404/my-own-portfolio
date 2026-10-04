import assert from "node:assert/strict";
import { createServer } from "vite";
import { createSSRApp, createRenderer, h, ref, nextTick } from "vue";
import { renderToString } from "vue/server-renderer";
import { createMemoryHistory, createRouter } from "vue-router";

const server = await createServer({ server: { middlewareMode: true }, appType: "custom" });
const previousStorage = globalThis.localStorage;
try {
  const storage = new Map();
  globalThis.localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  };
  const { default: client } = await server.ssrLoadModule("/src/api/axiosClient.ts");
  const captured = [];
  client.defaults.adapter = async (config) => {
    captured.push(config);
    return {
      data: { data: [], pagination: {} },
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    };
  };
  const common = {
    ids: "9223372036854775807,20",
    createdFrom: "2026-01-01T00:00:00+07:00",
    createdTo: "2026-10-01T00:00:00Z",
    updatedFrom: "2026-02-01T00:00:00Z",
    updatedTo: "2026-10-01T00:00:00Z",
    page: 2,
    size: 30,
    sortBy: ["createdAt", "id"],
    sortDir: ["desc", "asc"],
  };
  const cases = [
    [
      "project",
      "getProjects",
      {
        status: "active,development",
        slug: "sample",
        projectTypes: "backend,api",
        linkTypes: "github,demo",
        techStack: "Spring,Vue",
      },
    ],
    ["skill", "getSkills", { search: "sql", category: "framework,database" }],
    ["use", "getUses", { category: "software,hardware" }],
    ["blog", "getBlogs", { slug: "sample", isPublished: false, minViews: 0, maxViews: 100 }],
    [
      "experience",
      "getExperiences",
      {
        isCurrent: false,
        companyName: "acme",
        position: "engineer",
        startDate: "2021-01-01",
        endDate: "2026-01-01",
      },
    ],
    [
      "user",
      "getUsers",
      {
        role: "ADMIN,USER",
        provider: "LOCAL,GITHUB",
        gender: "FEMALE,OTHER",
        email: "mail@example.com",
        nickname: "sample",
        dateOfBirthFrom: "1990-01-01",
        dateOfBirthTo: "2000-01-01",
      },
    ],
    [
      "blogAttachment",
      "getBlogAttachments",
      { search: "report", blogId: "10", fileType: "image,document" },
    ],
  ];
  for (const [name, method, filters] of cases) {
    const service = await server.ssrLoadModule(`/src/services/${name}Service.ts`);
    const request = { ...common, ...filters };
    await service[`${name}Service`][method](request);
    const config = captured.at(-1);
    assert.deepEqual(config.params, request, `${name}: preserve every filter`);
    const uri = client.getUri(config);
    assert.match(uri, /%2B07%3A00/, `${name}: encode timezone plus sign`);
    const query = new URL(uri, "https://example.com").searchParams;
    assert.deepEqual(query.getAll("sortBy"), ["createdAt", "id"]);
    if ("isPublished" in filters) assert.equal(query.get("isPublished"), "false");
    if ("isCurrent" in filters) assert.equal(query.get("isCurrent"), "false");
    const schema = await server.ssrLoadModule(`/src/schemas/${name}.schema.ts`);
    assert.deepEqual(schema[`${name}QueryParamsSchema`].parse(request), request);
  }
  const { baseQueryParamsSchema } = await server.ssrLoadModule("/src/schemas/api.schema.ts");
  assert.equal(baseQueryParamsSchema.safeParse({ size: 101 }).success, false);

  const { useQuerySync } = await server.ssrLoadModule("/src/composables/useQuerySync.ts");
  const { advancedFilterDefaults } = await server.ssrLoadModule("/src/utils/advancedFilters.ts");
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: "/", component: { render: () => null } }],
  });
  await router.push(
    "/?isCurrent=false&isPublished=false&minViews=0&maxViews=100&size=999&status=active&status=development&sortBy=createdAt&sortBy=id",
  );
  let restored;
  const syncApp = createSSRApp({
    setup() {
      const params = ref({
        ...advancedFilterDefaults("blogs"),
        isCurrent: undefined,
        status: undefined,
        page: 1,
        size: 10,
        sortBy: ["createdAt"],
      });
      useQuerySync(params);
      restored = params.value;
      return () => h("div");
    },
  });
  syncApp.use(router);
  await renderToString(syncApp);
  assert.equal(restored.isCurrent, false);
  assert.equal(restored.isPublished, false);
  assert.equal(restored.minViews, 0);
  assert.equal(restored.maxViews, 100);
  assert.equal(restored.size, 100);
  assert.equal(restored.status, "active,development");
  assert.deepEqual(restored.sortBy, ["createdAt", "id"]);

  // Mount and unmount real Vue scopes to test navigating away, mutations, and reloads.
  const renderer = createRenderer({
    createComment: () => ({}),
    createText: () => ({}),
    createElement: () => ({}),
    insert() {},
    remove() {},
    setText() {},
    setElementText() {},
    patchProp() {},
    parentNode: () => null,
    nextSibling: () => null,
  });
  const navigationRouter = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/admin/blogs", name: "AdminBlogs", component: { render: () => null } },
      { path: "/admin/blogs/edit", name: "EditBlog", component: { render: () => null } },
      { path: "/en/blogs", name: "Blogs", component: { render: () => null } },
    ],
  });
  const filterOptions = { persistFilters: { resource: "blogs" } };
  function mountFilters() {
    let params;
    const app = renderer.createApp({
      setup() {
        params = ref({ ...advancedFilterDefaults("blogs"), page: 1, size: 10, search: "" });
        useQuerySync(params, filterOptions);
        return () => null;
      },
    });
    app.use(navigationRouter);
    app.mount({});
    return { params, app };
  }
  async function flushNavigation() {
    await nextTick();
    await new Promise((resolve) => setImmediate(resolve));
  }
  await navigationRouter.push("/admin/blogs");
  let mounted = mountFilters();
  mounted.params.value = {
    ...mounted.params.value,
    isPublished: false,
    minViews: 0,
    maxViews: 100,
  };
  const storageKey = "portfolio:advanced-filters:v1:AdminBlogs";
  assert.equal(
    JSON.parse(storage.get(storageKey)).isPublished,
    "false",
    "save immediately before leaving",
  );
  await flushNavigation();
  assert.equal(navigationRouter.currentRoute.value.query.minViews, "0");
  mounted.app.unmount();
  await navigationRouter.push("/admin/blogs/edit");
  const { blogService } = await server.ssrLoadModule("/src/services/blogService.ts");
  await blogService.updateBlog({ id: "10", data: { isPublished: true } });
  await navigationRouter.push("/admin/blogs");
  mounted = mountFilters();
  assert.equal(
    mounted.params.value.isPublished,
    false,
    "filters survive a mutation and return from form",
  );
  assert.equal(mounted.params.value.minViews, 0);
  await flushNavigation();
  assert.equal(
    navigationRouter.currentRoute.value.query.isPublished,
    "false",
    "restore the URL too",
  );
  mounted.app.unmount();
  await navigationRouter.push("/en/blogs");
  mounted = mountFilters();
  assert.equal(
    mounted.params.value.isPublished,
    undefined,
    "public and admin filters stay separate",
  );
  await flushNavigation();
  mounted.app.unmount();
  await navigationRouter.push("/admin/blogs?maxViews=50");
  mounted = mountFilters();
  assert.equal(mounted.params.value.maxViews, 50, "explicit shared URL replaces stored filters");
  assert.equal(
    mounted.params.value.isPublished,
    undefined,
    "do not mix an explicit URL with stored filters",
  );
  await flushNavigation();
  mounted.app.unmount();
  await navigationRouter.push("/admin/blogs");
  mounted = mountFilters();
  assert.equal(
    mounted.params.value.maxViews,
    50,
    "a fresh mount without query restores saved filters",
  );
  mounted.params.value = { ...mounted.params.value, ...advancedFilterDefaults("blogs") };
  assert.equal(storage.has(storageKey), false, "reset removes saved filters immediately");
  await flushNavigation();
  assert.equal(navigationRouter.currentRoute.value.query.maxViews, undefined);
  mounted.app.unmount();
  await navigationRouter.push("/admin/blogs");
  mounted = mountFilters();
  assert.equal(
    mounted.params.value.maxViews,
    undefined,
    "reset filters must not return on remount",
  );
  await flushNavigation();
  mounted.app.unmount();

  // Exercise the actual form handlers in Vue's setup context without a browser.
  const { default: panel } = await server.ssrLoadModule(
    "/src/components/shared/AppAdvancedFilters.vue",
  );
  const { i18n } = await server.ssrLoadModule("/src/i18n/index.ts");
  const emitted = [];
  const panelApp = createSSRApp({
    setup() {
      const state = panel.setup(
        {
          modelValue: { page: 4, search: "preserved", size: 20, isPublished: false },
          resource: "blogs",
          exclude: [],
        },
        { expose() {}, emit: (...args) => emitted.push(args) },
      );
      assert.equal(state.draft.isPublished, "false");
      Object.assign(state.draft, { minViews: "100", maxViews: "5" });
      state.apply();
      assert.equal(emitted.length, 0, "invalid ranges must not fetch");
      Object.assign(state.draft, {
        minViews: "0",
        maxViews: "100",
        ids: "9223372036854775807, 20",
        createdFrom: "2026-01-01T00:00:00",
      });
      state.apply();
      const result = emitted.at(-1)[1];
      assert.equal(result.page, 1);
      assert.equal(result.search, "preserved");
      assert.equal(result.isPublished, false);
      assert.equal(result.minViews, 0);
      assert.equal(result.ids, "9223372036854775807,20");
      assert.equal(result.createdFrom, new Date("2026-01-01T00:00:00").toISOString());
      Object.assign(state.draft, { minViews: "-1" });
      state.apply();
      assert.equal(emitted.length, 1);
      state.reset();
      assert.equal(emitted.at(-1)[1].isPublished, undefined);
      assert.equal(emitted.at(-1)[1].search, "preserved");
      return () => h("div");
    },
  });
  panelApp.use(i18n);
  await renderToString(panelApp);
  const headerApp = createSSRApp({
    render: () => h(panel, { modelValue: { isPublished: false, minViews: 0 }, resource: "blogs" }),
  });
  headerApp.use(i18n);
  const activeHtml = await renderToString(headerApp);
  assert.match(
    activeHtml,
    /<\/details>[\s\S]*<button/,
    "reset button is outside the collapsed details",
  );
  const emptyHeaderApp = createSSRApp({
    render: () => h(panel, { modelValue: {}, resource: "blogs" }),
  });
  emptyHeaderApp.use(i18n);
  const emptyHtml = await renderToString(emptyHeaderApp);
  assert.doesNotMatch(
    emptyHtml,
    /<\/details>[\s\S]*<button/,
    "hide header reset when no filters are active",
  );
  console.log(
    "Filtering checks passed: 7 services, URL decoding, persistence across navigation/mutations, form validation, header reset, and request encoding.",
  );
} finally {
  globalThis.localStorage = previousStorage;
  await server.close();
}
