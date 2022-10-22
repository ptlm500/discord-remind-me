interface Generator<T> {
  (partial?: Partial<T>): T;
}

interface GeneratorWithMany<T> extends Generator<T> {
  many: (number?: number, template?: Partial<T> | Partial<T>[]) => T[];
}

function wrapWithMany<T>(generator: Generator<T>): GeneratorWithMany<T> {
  const generatorWithMany = generator as GeneratorWithMany<T>;

  generatorWithMany.many = (number = 10, template?: Partial<T> | Partial<T>[]) => {
    return Array.from({ length: number }, (_, idx) => {
      const partial = Array.isArray(template) ? template[idx] : template;
      return generator(partial);
    });
  };

  return generatorWithMany;
}

export default wrapWithMany;
