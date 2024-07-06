type PresetTuple<K, V = K, L = K, Extra = object> = readonly [
  K,
  V?,
  L?,
  Extra?
];

type TPreset = Readonly<Array<PresetTuple<any, any, any, any>>>;

type EnumKeyType<T extends TPreset> = T[number][0];
type EnumValueType<T extends TPreset> = T[number][1] extends undefined
  ? EnumKeyType<T>
  : T[number][1];
type EnumLabelType<T extends TPreset> = T[number][2] extends undefined
  ? EnumKeyType<T>
  : T[number][2];
type EnumExtraInfoType<T extends TPreset> = T[number][3] extends undefined
  ? object
  : T[number][3];

type MapValueType<T extends TPreset> = {
  value: EnumValueType<T>;
  label: EnumLabelType<T>;
  extraInfo: EnumExtraInfoType<T>;
};

type DicValue<T extends TPreset> = {
  value: EnumValueType<T>;
  label: EnumLabelType<T>;
} & EnumExtraInfoType<T>;

type TOptionAttrsAlias = { labelAlias: string; valueAlias: string };

export class AsEnum<T extends TPreset> {
  private mapInfo: Map<EnumKeyType<T>, MapValueType<T>>;
  private dic: Record<EnumKeyType<T>, DicValue<T>> = {} as any;
  private optionAttrsAlias: TOptionAttrsAlias = {
    labelAlias: "label",
    valueAlias: "value"
  };
  private optionsCache: Array<any> = [];

  constructor(preset: T) {
    const mapInfoTuples: Array<[EnumKeyType<T>, MapValueType<T>]> = [];
    preset.forEach(tuple => {
      const [
        key,
        value = key,
        label = key,
        extraInfo = {} as EnumExtraInfoType<T>
      ] = tuple;
      if (typeof key === "number" || typeof key === "string") {
        this.dic[key] = { ...extraInfo, value, label };
      }
      mapInfoTuples.push([key, { value, label, extraInfo }]);
    });

    this.mapInfo = new Map(mapInfoTuples);
  }

  public valueByKey(key: EnumKeyType<T>) {
    return this.mapInfo.get(key)?.value;
  }

  public labelByKey(key: EnumKeyType<T>) {
    return this.mapInfo.get(key)?.label;
  }

  public infoByKey(key: EnumKeyType<T>) {
    return this.mapInfo.get(key);
  }

  public labelByValue(value: EnumValueType<T> | EnumKeyType<T>) {
    return this.infoByValue(value)?.label;
  }

  public keyByValue(value: EnumValueType<T> | EnumKeyType<T>) {
    return Array.from(this.mapInfo.entries()).find(
      ([_, v]) => v.value === value
    )?.[0];
  }

  public infoByValue(value: EnumValueType<T> | EnumKeyType<T>) {
    return Array.from(this.mapInfo.values()).find(item => item.value === value);
  }

  public genOptions(params?: Partial<TOptionAttrsAlias>) {
    const { labelAlias, valueAlias } = {
      ...this.optionAttrsAlias,
      ...(params ?? {})
    };
    if (
      labelAlias === this.optionAttrsAlias.labelAlias &&
      valueAlias === this.optionAttrsAlias.valueAlias &&
      this.optionsCache.length
    ) {
      return this.optionsCache;
    }

    this.optionsCache = Array.from(this.mapInfo.values()).map(item => {
      return {
        [labelAlias]: item.label,
        [valueAlias]: item.value,
        ...item.extraInfo // Include extraInfo in options
      };
    });
    this.optionAttrsAlias = { labelAlias, valueAlias };

    return this.optionsCache;
  }

  public getDic() {
    return this.dic;
  }

  public get keys() {
    return Array.from(this.mapInfo.keys());
  }

  public get values() {
    return Array.from(this.mapInfo.values()).map(item => item.value);
  }

  public get labels() {
    return Array.from(this.mapInfo.values()).map(item => item.label);
  }
}

export function asEnum<T extends TPreset>(
  preset: T
): Omit<AsEnum<T>, "getDic"> & Record<EnumKeyType<T>, DicValue<T>> {
  const e = new AsEnum(preset);
  const result = {
    ...e.getDic(),
    valueByKey: e.valueByKey.bind(e),
    labelByKey: e.labelByKey.bind(e),
    labelByValue: e.labelByValue.bind(e),
    keyByValue: e.keyByValue.bind(e),
    genOptions: e.genOptions.bind(e),
    infoByKey: e.infoByKey.bind(e),
    infoByValue: e.infoByValue.bind(e),
    keys: e.keys,
    values: e.values,
    labels: e.labels
  };
  return result;
}