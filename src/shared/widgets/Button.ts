class Button {
    element: void;
    private name: Error;

    constructor() {
        this.element = this.createElement();
    }

    createElement() {
        throw `${this.name}: createElement must be overridden!`;
    }
}

export default Button;