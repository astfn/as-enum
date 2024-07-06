import { asEnum } from "../src";

describe("happy path", () => {
  // 默认值的填充
  it("fill in default values", () => {
    const enumOptions = asEnum([
      ["state1"],
      ["state2", "state2 value"]
    ] as const);

    // state1
    // console.log('enumOptions', enumOptions)
    expect(enumOptions.state1?.value).toBe("state1");
    expect(enumOptions.state1?.label).toBe("state1");

    // state2
    expect(enumOptions.state2.value).toBe("state2 value");
    expect(enumOptions.state2.label).toBe("state2");
  });

  // 支持多类型枚举（不仅限于 string or number）
  it("multi type enumeration value", () => {
    const state3_value = [1, 2, 3];
    const state4_value = () => {
      return "state4_value";
    };
    const enumOptions = asEnum([
      ["state1", 1],
      ["state2", "state2_value", "state2 label"],
      ["state3", state3_value, "label3"],
      ["state4", state4_value, "state4 label"]
    ] as const);

    expect(enumOptions.state1.value).toBe(1);
    expect(enumOptions.state2.value).toBe("state2_value");
    expect(enumOptions.state3.value).toBe(state3_value);
    expect(enumOptions.state4.value).toBe(state4_value);
  });

  // 支持添加额外的枚举信息
  it("support adding additional enumeration information", () => {
    const enumOptions = asEnum([
      ["state1", 1, , { color: "white" }],
      ["state2", 2, "state2 label", { color: "black" }],
      ["state3", 3]
    ] as const);
    // state1
    expect(enumOptions.state1.label).toBe("state1");
    expect(enumOptions.state1.color).toBe("white");
    // state2
    expect(enumOptions.state2.label).toBe("state2 label");
    expect(enumOptions.state2.color).toBe("black");
    // state3
    expect(enumOptions.state3.color).toBe(undefined);
  });

  // 各个枚举值附加信息属性不统一时，可以通过工厂函数获得类型
  it("complex type prompt", () => {
    const createExtraInfo = (info: { color?: string; bgColor?: string }) =>
      info;
    const enumOptions = asEnum([
      ["state1", 1, , createExtraInfo({ color: "white" })],
      ["state2", 2, "state2 label", createExtraInfo({ color: "black" })],
      ["state3", 3, , createExtraInfo({ bgColor: "colorful black" })],
      ["state4", 4]
    ] as const);
    // state1
    expect(enumOptions.state1.label).toBe("state1");
    expect(enumOptions.state1.color).toBe("white");
    // state2
    expect(enumOptions.state2.label).toBe("state2 label");
    expect(enumOptions.state2.color).toBe("black");
    // state3
    expect(enumOptions.state3.bgColor).toBe("colorful black");
    // state4
    expect(enumOptions.state4.color).toBe(undefined);
  });

  // 通过复杂类型的枚举键,获取相应的枚举信息
  it("Obtain corresponding enumeration information through complex type enumeration keys", () => {
    const state1_key = 1;
    const state3_key = { name: "state3_key" };
    const state4_key = () => {
      return "state4_key";
    };

    const enumOptions = asEnum([
      [state1_key],
      ["state2_key", "state2_value", "state2 label"],
      [state3_key, "state3_value", "state3 label", { color: "black" }],
      [state4_key]
    ] as const);

    // 普通 key 类型,转化为字典的 key 后，统一为 string。该场景下具有完美的类型提示
    expect(enumOptions[1].value).toBe(1);
    expect(enumOptions.state2_key.label).toBe("state2 label");

    // 复杂(引用)类型的 key,转化为字典的 key 后,会自动 toString，导致 key 不明确。可利用内置的 infoByKey 获取
    expect(enumOptions.infoByKey(state3_key)?.value).toBe("state3_value");
    expect(enumOptions.infoByKey(state3_key)?.extraInfo?.color).toBe("black");
    expect(enumOptions.infoByKey(state4_key)?.value).toBe(state4_key);
  });
});
