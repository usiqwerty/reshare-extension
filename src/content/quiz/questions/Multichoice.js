import Question from "content/quiz/questions/Question"
import * as Strings from "shared/utils/strings"
import * as Images from "shared/utils/images"
import MagicButton from "shared/widgets/MagicButton"

class Multichoice extends Question {

    constructor(args) {
        super(args);

        const answer = this.container.querySelector("div.answer");
        const inputs = answer.querySelectorAll("input[type=\"radio\"], input[type=\"checkbox\"]");

        this.options = {};
        this.answer  = answer;
        this.type    = inputs[0].type;
        this.questionType = "multichoice";

        for (const input of inputs) {
            const label = input.nextSibling;

            const sign = [
                Strings.removeInvisible(label.lastChild.textContent) || "[NO TEXT]",
                Images.serializeArray(label.querySelectorAll("img"))
            ];

            this.options[sign.join(";")] = input;
        }
    }
    /** @param {string[]} anchor_list*/
    createWidgetAnchor(anchor_list) {
        const anchor=anchor_list[0]
        if (this.type === "radio") {
            const button = new MagicButton().element;
            this.answer.appendChild(button);

            const onClick = (data) => {
                let choice = this.options[data.sign[0]]; //
                console.log("options", this.options);
                console.log("data", data);
                // Try to find similar node in case 
                // the text of the question has changed
                if (!choice) {
                    const candidate = Strings.findSimilar(data.sign[0], Object.keys(this.options)); //

                    if (!candidate) {
                        return;
                    }

                    choice = this.options[candidate];
                }

                choice.checked = true;
            }

            return { onClick, button };
        }
        else if (this.type === "checkbox") {
            let choice = this.options[anchor]; //.sign
            // Try to find similar nodes in case 
            // the text of the question has changed
            console.log("options:",this.options);
            console.log("anchor:", anchor);
            if (!choice) {
                const candidate = Strings.findSimilar(anchor, Object.keys(this.options)); //.sign

                if (!candidate) {
                    console.log("Could not find such answer:", anchor);
                    return;
                }

                choice = this.options[candidate];
            }

            const button = new MagicButton().element;
            choice.parentNode.insertBefore(button, choice.nextSibling);
            const onClick = (data) => {
                choice.checked = data.checked;//data.checked;
                //console.log(data)
            }

            return { onClick, button };
        }

        return null;
    }
}

export default Multichoice;