module.exports = [
"[turbopack-node]/transforms/postcss.ts { CONFIG => \"[project]/projects/e-commerce/postcss.config.mjs [postcss] (ecmascript)\" } [postcss] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "chunks/a7786_fbbffb36._.js",
  "chunks/[root-of-the-server]__f2d6c494._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[turbopack-node]/transforms/postcss.ts { CONFIG => \"[project]/projects/e-commerce/postcss.config.mjs [postcss] (ecmascript)\" } [postcss] (ecmascript)");
    });
});
}),
];