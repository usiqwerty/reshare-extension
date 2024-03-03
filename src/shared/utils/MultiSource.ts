import DataSource from "./DataSource";

class MultiSource {
    private sources: DataSource[];

    constructor(sources: DataSource[]) {

        this.sources = [];

        for (const source of sources)
            this.sources.push(source);
    }

    get(key: string) {
        for (const source of this.sources) {
            if (source.get(key) !== null)
                return source.get(key);
        }
        return null;
    }
}

export default MultiSource;