import Button from "./Button";

class MagicButton extends Button {
    element: any;

    createElement() {
        const element = document.createElement("span");
        element.classList.add("ss-btn", "icon", "fa", "fa-magic", "fa-fw");

        return element;
    }

}

export default MagicButton;