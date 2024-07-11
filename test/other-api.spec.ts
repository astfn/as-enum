import { asEnum } from "../src";

describe("pther-api", () => {
  const state4_key = { name: "state4_key" };
  const state5_key = () => {
    return "state5_key";
  };

  const enumOptions = asEnum([
    [2],
    [1, , "state2_label"],
    ["state3_key", "state3_value", "state3_label"],
    [
      state4_key,
      "state4_value",
      "state4_label",
      { color: "#aaa", disabled: true }
    ],
    [state5_key, , state5_key()]
  ] as const);

  // 获取迭代信息, 结果的顺序严格按照配置的顺序来
  it("iteration info", () => {
    expect(enumOptions.genOptions()).toEqual([
      { label: 2, value: 2 },
      { label: "state2_label", value: 1 },
      { label: "state3_label", value: "state3_value" },
      {
        color: "#aaa",
        disabled: true,
        label: "state4_label",
        value: "state4_value"
      },
      { label: "state5_key", value: state5_key }
    ]);

    const aliasOptions = [
      { labelKey: 2, valueKey: 2 },
      { labelKey: "state2_label", valueKey: 1 },
      { labelKey: "state3_label", valueKey: "state3_value" },
      {
        color: "#aaa",
        disabled: true,
        labelKey: "state4_label",
        valueKey: "state4_value"
      },
      { labelKey: "state5_key", valueKey: state5_key }
    ];

    // genOptions 的缓存特性
    expect(
      enumOptions.genOptions({ labelAlias: "labelKey", valueAlias: "valueKey" })
    ).toEqual(aliasOptions);
    expect(enumOptions.genOptions()).toEqual(aliasOptions);

    expect(enumOptions.keys).toEqual([
      2,
      1,
      "state3_key",
      state4_key,
      state5_key
    ]);

    expect(enumOptions.values).toEqual([
      2,
      1,
      "state3_value",
      "state4_value",
      state5_key
    ]);

    expect(enumOptions.labels).toEqual([
      2,
      "state2_label",
      "state3_label",
      "state4_label",
      "state5_key"
    ]);
  });

  // 获取某个配置信息
  it("Obtain a certain configuration information", () => {
    // get value by key
    expect(enumOptions.valueByKey(2)).toBe(2);
    expect(enumOptions.valueByKey(1)).toBe(1);
    expect(enumOptions.valueByKey("state3_key")).toBe("state3_value");
    expect(enumOptions.valueByKey(state4_key)).toBe("state4_value");
    expect(enumOptions.valueByKey(state5_key)).toBe(state5_key);

    // get label by key
    expect(enumOptions.labelByKey(2)).toBe(2);
    expect(enumOptions.labelByKey(1)).toBe("state2_label");
    expect(enumOptions.labelByKey("state3_key")).toBe("state3_label");
    expect(enumOptions.labelByKey(state4_key)).toBe("state4_label");
    expect(enumOptions.labelByKey(state5_key)).toBe("state5_key");

    // get extra info by key
    expect(enumOptions.extraInfoByKey(state4_key)).toEqual({
      color: "#aaa",
      disabled: true
    });
    expect(enumOptions.extraInfoByKey(state5_key)).toEqual({});

    // get info by key
    expect(enumOptions.infoByKey(state5_key)).toEqual({
      label: "state5_key",
      value: state5_key,
      extraInfo: {}
    });
    expect(enumOptions.infoByKey(state4_key)).toEqual({
      label: "state4_label",
      value: "state4_value",
      extraInfo: { color: "#aaa", disabled: true }
    });

    // get key by value
    expect(enumOptions.keyByValue(2)).toBe(2);
    expect(enumOptions.keyByValue(1)).toBe(1);
    expect(enumOptions.keyByValue("state3_value")).toBe("state3_key");
    expect(enumOptions.keyByValue("state4_value")).toBe(state4_key);
    expect(enumOptions.keyByValue(state5_key)).toBe(state5_key);

    // get label by value
    expect(enumOptions.labelByValue(2)).toBe(2);
    expect(enumOptions.labelByValue(1)).toBe("state2_label");
    expect(enumOptions.labelByValue("state3_value")).toBe("state3_label");
    expect(enumOptions.labelByValue("state4_value")).toBe("state4_label");
    expect(enumOptions.labelByValue(state5_key)).toBe("state5_key");

    //get extra info by value
    expect(enumOptions.extraInfoByValue("state4_value")).toEqual({
      color: "#aaa",
      disabled: true
    });
    expect(enumOptions.extraInfoByValue(state5_key)).toEqual({});

    // get info by value
    expect(enumOptions.infoByValue("state4_value")).toEqual({
      extraInfo: { color: "#aaa", disabled: true },
      label: "state4_label",
      value: "state4_value"
    });
    expect(enumOptions.infoByValue(state5_key)).toEqual({
      extraInfo: {},
      label: "state5_key",
      value: state5_key
    });
  });
});
