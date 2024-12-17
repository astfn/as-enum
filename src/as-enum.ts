/**
 * 枚举项的元组类型
 * @template K - 键的类型
 * @template V - 值的类型，默认继承键的值（与键类型相同）
 * @template L - 标签的类型，默认继承键的值（与键类型相同）
 * @template Extra - 额外信息的类型，默认为空对象
 */
type PresetTuple<K, V = K, L = K, Extra = object> = readonly [
  K,
  V?,
  L?,
  Extra?
];

/** 预设值的类型，只读的元组数组 */
type TPreset = Readonly<Array<PresetTuple<any, any, any, any>>>;

/** 从预设中提取键的类型 */
type EnumKeyType<T extends TPreset> = T[number][0];
/** 从预设中提取值的类型，如果未指定则使用键类型 */
type EnumValueType<T extends TPreset> = T[number][1] extends undefined
  ? EnumKeyType<T>
  : T[number][1];
/** 从预设中提取标签的类型，如果未指定则使用键类型 */
type EnumLabelType<T extends TPreset> = T[number][2] extends undefined
  ? EnumKeyType<T>
  : T[number][2];
/** 从预设中提取额外信息的类型，如果未指定则为空对象 */
type EnumExtraInfoType<T extends TPreset> = T[number][3] extends undefined
  ? object
  : T[number][3];

/** 可能的值类型，包括显式指定的值和键 */
type TPossibleValueType<T extends TPreset> = EnumValueType<T> | EnumKeyType<T>;

/** 内部使用的映射值类型 */
type MapValueType<T extends TPreset> = {
  value: EnumValueType<T>;
  label: EnumLabelType<T>;
  extraInfo: EnumExtraInfoType<T>;
};

/** 字典值类型，用于生成类似原生枚举的访问形式 */
type DicValue<T extends TPreset> = {
  value: EnumValueType<T>;
  label: EnumLabelType<T>;
} & EnumExtraInfoType<T>;

/** 选项属性别名配置 */
type TOptionAttrsAlias = { labelAlias: string; valueAlias: string };

/**
 * 增强型枚举类，提供比原生 enum 更丰富的功能
 * @template T - 预设元组类型
 */
export class AsEnum<T extends TPreset> {
  /** 存储枚举项的完整信息 */
  private mapInfo: Map<EnumKeyType<T>, MapValueType<T>>;
  /** 值到键的反向映射，用于优化查找性能 */
  private valueToKeyMap: Map<TPossibleValueType<T>, EnumKeyType<T>>;
  /** 类似原生枚举的访问字典 */
  private dic: Record<EnumKeyType<T>, DicValue<T>> = {} as any;
  /** 选项列表篇属性别名的默认值 */
  private optionAttrsAlias: TOptionAttrsAlias = {
    labelAlias: "label",
    valueAlias: "value"
  };
  /** 选项列表的缓存 */
  private optionsCache: Array<any> = [];

  /** 类型标记，用于类型推导 */
  public _key_type!: EnumKeyType<T>;
  public _possible_v_type!: TPossibleValueType<T>;
  public _strict_v_type!: EnumValueType<T>;
  public _extra_info_type!: EnumExtraInfoType<T>;

  constructor(preset: T) {
    const mapInfoTuples: Array<[EnumKeyType<T>, MapValueType<T>]> = [];
    const valueToKeyEntries: Array<[TPossibleValueType<T>, EnumKeyType<T>]> =
      [];

    preset.forEach(tuple => {
      const [
        key,
        value = key,
        label = key,
        extraInfo = {} as EnumExtraInfoType<T>
      ] = tuple;

      // 只有当 key 是基础类型时才加入 dic，支持类似原生枚举的访问方式
      if (typeof key === "number" || typeof key === "string") {
        this.dic[key] = { ...extraInfo, value, label };
      }

      mapInfoTuples.push([key, { value, label, extraInfo }]);
      valueToKeyEntries.push([value, key]);
    });

    this.mapInfo = new Map(mapInfoTuples);
    this.valueToKeyMap = new Map(valueToKeyEntries);
  }

  /** 根据键获取值 */
  public valueByKey(key: EnumKeyType<T>) {
    return this.mapInfo.get(key)?.value;
  }

  /** 根据键获取标签 */
  public labelByKey(key: EnumKeyType<T>) {
    return this.mapInfo.get(key)?.label;
  }

  /** 根据键获取额外信息 */
  public extraInfoByKey(key: EnumKeyType<T>) {
    return this.mapInfo.get(key)?.extraInfo;
  }

  /** 根据键获取完整信息 */
  public infoByKey(key: EnumKeyType<T>) {
    return this.mapInfo.get(key);
  }

  /** 根据值获取标签 */
  public labelByValue(value: TPossibleValueType<T>) {
    return this.infoByValue(value)?.label;
  }

  /** 根据值获取键 */
  public keyByValue(value: TPossibleValueType<T>) {
    return this.valueToKeyMap.get(value);
  }

  /** 根据值获取额外信息 */
  public extraInfoByValue(value: TPossibleValueType<T>) {
    return this.infoByValue(value)?.extraInfo;
  }

  /** 根据值获取完整信息 */
  public infoByValue(value: TPossibleValueType<T>) {
    const key = this.valueToKeyMap.get(value);
    return key ? this.mapInfo.get(key) : undefined;
  }

  /**
   * 生成选项列表，常用于下拉菜单等场景
   * @param params - 自定义选项的属性名
   * @returns 包含标签、值和额外信息的选项列表
   */
  public genOptions(params?: Partial<TOptionAttrsAlias>) {
    const { labelAlias, valueAlias } = {
      ...this.optionAttrsAlias,
      ...(params ?? {})
    };

    // 如果属性名未变且缓存存在，直接返回缓存
    if (
      labelAlias === this.optionAttrsAlias.labelAlias &&
      valueAlias === this.optionAttrsAlias.valueAlias &&
      this.optionsCache.length
    ) {
      return this.optionsCache;
    }

    this.optionsCache = Array.from(this.mapInfo.values()).map(item => ({
      [labelAlias]: item.label,
      [valueAlias]: item.value,
      ...item.extraInfo // Include extraInfo in options
    }));

    this.optionAttrsAlias = { labelAlias, valueAlias };
    return this.optionsCache;
  }

  /** 获取类似原生枚举的访问字典 */
  public getDic() {
    return this.dic;
  }

  /** 获取所有键的列表 */
  public get keys() {
    return Array.from(this.mapInfo.keys());
  }

  /** 获取所有值的列表 */
  public get values() {
    return Array.from(this.mapInfo.values()).map(item => item.value);
  }

  /** 获取所有标签的列表 */
  public get labels() {
    return Array.from(this.mapInfo.values()).map(item => item.label);
  }
}

/**
 * 创建增强型枚举的工厂函数
 * @template T - 预设元组类型
 * @param preset - 枚举预设值
 * @returns 增强型枚举对象，支持类似原生枚举的访问方式和额外的工具方法
 * @example
 * const MyEnum = asEnum([
 *   ['A', 1, '选项A'],
 *   ['B', 2, '选项B', { disabled: true }]
 * ]);
 *
 * MyEnum.A.value  // 1
 * MyEnum.valueByKey('B')  // 2
 * MyEnum.labelByValue(1)  // '选项A'
 */
export function asEnum<T extends TPreset>(
  preset: T
): Omit<AsEnum<T>, "getDic"> & Record<EnumKeyType<T>, DicValue<T>> {
  const e = new AsEnum(preset);
  const result = {
    ...e.getDic(),
    valueByKey: e.valueByKey.bind(e),
    labelByKey: e.labelByKey.bind(e),
    extraInfoByKey: e.extraInfoByKey.bind(e),
    infoByKey: e.infoByKey.bind(e),
    labelByValue: e.labelByValue.bind(e),
    keyByValue: e.keyByValue.bind(e),
    extraInfoByValue: e.extraInfoByValue.bind(e),
    infoByValue: e.infoByValue.bind(e),
    genOptions: e.genOptions.bind(e),
    keys: e.keys,
    values: e.values,
    labels: e.labels,
    _key_type: e._key_type,
    _possible_v_type: e._possible_v_type,
    _strict_v_type: e._strict_v_type,
    _extra_info_type: e._extra_info_type
  };
  return result;
}
