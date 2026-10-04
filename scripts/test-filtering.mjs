import assert from "node:assert/strict";
import { createServer } from "vite";
import { createSSRApp, h, ref } from "vue";
import { renderToString } from "vue/server-renderer";
import { createMemoryHistory, createRouter } from "vue-router";

const server = await createServer({ server: { middlewareMode: true }, appType: "custom" });
const previousStorage = globalThis.localStorage;
try {
  globalThis.localStorage = { getItem: () => null };
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
  console.log(
    "Filtering checks passed: 7 services, URL decoding, form validation, reset, and request encoding.",
  );
} finally {
  globalThis.localStorage = previousStorage;
  await server.close();
}
