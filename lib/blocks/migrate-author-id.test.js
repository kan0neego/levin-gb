const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const {
  hasSnapshotAuthorFields,
  migrateAuthorIdOnly,
} = require("./migrate-author-id.js");

describe("hasSnapshotAuthorFields", () => {
  it("false when author is only an id", () => {
    assert.equal(hasSnapshotAuthorFields({ author: { id: 12 } }), false);
  });

  it("false when author is missing or not an object", () => {
    assert.equal(hasSnapshotAuthorFields({}), false);
    assert.equal(hasSnapshotAuthorFields({ author: null }), false);
    assert.equal(hasSnapshotAuthorFields({ author: "12" }), false);
    assert.equal(hasSnapshotAuthorFields({ author: [] }), false);
  });

  it("true when saved author still has entity snapshot fields", () => {
    assert.equal(
      hasSnapshotAuthorFields({
        author: {
          id: 12,
          name: "Иванов",
          spec: "хирург",
          avatar: "/a.jpg",
          picture: "/p.jpg",
        },
      }),
      true,
    );
    assert.equal(
      hasSnapshotAuthorFields({
        author: { id: 12, experience: "10 лет" },
      }),
      true,
    );
  });
});

describe("migrateAuthorIdOnly", () => {
  it("keeps other attributes and strips snapshot fields", () => {
    assert.deepEqual(
      migrateAuthorIdOnly({
        heading: "Цитата",
        variations: "is-image",
        description: { edited: true, value: "текст" },
        author: {
          id: 12,
          name: "Иванов",
          spec: "хирург",
          avatar: "/a.jpg",
          picture: "/p.jpg",
          experience: "10 лет",
        },
      }),
      {
        heading: "Цитата",
        variations: "is-image",
        description: { edited: true, value: "текст" },
        author: { id: 12 },
      },
    );
  });

  it("normalizes a missing author to an empty id", () => {
    assert.deepEqual(migrateAuthorIdOnly({ heading: "" }), {
      heading: "",
      author: { id: "" },
    });
  });
});
