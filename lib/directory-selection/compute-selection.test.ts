import { computeCheckedFileKeys } from "./index";
import { collidingI18nItems, nestedI18nItems, rootPathB } from "./test-fixtures";

const allNestedFileKeys = new Set([
  "file:dir-1:resources/en.json",
  "file:dir-1:resources/ja.json",
  "file:dir-1:client.ts",
  "file:dir-1:index.ts",
  "file:dir-2:utils.ts",
]);

describe("computeCheckedFileKeys", () => {
  it("returns empty set by default", () => {
    expect(computeCheckedFileKeys(nestedI18nItems, [], [])).toEqual(
      new Set(),
    );
  });

  it("selects all registered files with /all", () => {
    expect(
      computeCheckedFileKeys(nestedI18nItems, [], [], true),
    ).toEqual(allNestedFileKeys);
  });

  it("selects only @ references when combined with #", () => {
    expect(
      computeCheckedFileKeys(
        nestedI18nItems,
        ["i18n/client.ts"],
        ["i18n/index.ts"],
      ),
    ).toEqual(new Set(["file:dir-1:client.ts"]));
  });

  it("selects all minus # excludes", () => {
    expect(
      computeCheckedFileKeys(nestedI18nItems, [], ["i18n/client.ts"]),
    ).toEqual(
      new Set([
        "file:dir-1:resources/en.json",
        "file:dir-1:resources/ja.json",
        "file:dir-1:index.ts",
        "file:dir-2:utils.ts",
      ]),
    );
  });

  it("selects directory subtree with @", () => {
    expect(
      computeCheckedFileKeys(nestedI18nItems, ["i18n/resources"], []),
    ).toEqual(
      new Set([
        "file:dir-1:resources/en.json",
        "file:dir-1:resources/ja.json",
      ]),
    );
  });

  it("matches colliding files only by absolute path", () => {
    const items = collidingI18nItems();

    expect(computeCheckedFileKeys(items, ["i18n/client.ts"], [])).toEqual(
      new Set(),
    );
    expect(
      computeCheckedFileKeys(items, [`${rootPathB}/client.ts`], []),
    ).toEqual(new Set(["file:dir-3:client.ts"]));
  });
});
