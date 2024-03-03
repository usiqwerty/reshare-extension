class DataSource {
    data: {
        quizId: number;
        quizName: any;
        courseId: number;
        courseName: any;
        bcItems: any[];
    };

    constructor() {
        this.data = {
            quizId: null,
            quizName: null,
            courseId: null,
            courseName: null,
            bcItems: [],
        };
        this.evaluate();
    }

    evaluate() {
        throw new Error("DataSource: process() is not overriden");
    }

    /**
     * @param {String} key
     */
    get(key) {
        if (this.data[key] === undefined)
            return null;

        if (this.data[key] === null)
            return null;

        if (Number.isNaN(this.data[key]))
            return null;

        return this.data[key];
    }
}

export default DataSource;