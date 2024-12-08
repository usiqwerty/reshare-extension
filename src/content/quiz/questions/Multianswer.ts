import Question from "../../../content/quiz/questions/Question";
import * as Images from "../../../shared/utils/images";
import * as Strings from "../../../shared/utils/strings";
import MagicButton from "../../../shared/widgets/MagicButton";
import {Anchor, MultichoiceSubquestion} from "../solver/types";
import {createShortanswerAnchor} from "./Shortanswer";
import {createMultichoiceCheckboxAnchor, createMultichoiceRadioAnchor} from "./Multichoice";

function createSelectAnchor(subq) {
    const button = new MagicButton().element;
    subq.node.parentNode.appendChild(button);

    const onClick = (data: string) => {
        let option = subq.optionMap[data];

        // Try to find similar options in case
        // the text of the question has changed
        if (!option) {
            const candidate = Strings.findSimilar(data, Object.keys(subq.optionMap));

            if (!candidate) {
                return;
            }

            option = subq.optionMap[candidate];
        }

        subq.node.value = option;
    }

    return {onClick, button};
}

class Multianswer extends Question {
    questionType: string;
    container: any;
    private multichoice: {[key: string]: MultichoiceSubquestion};
    private edit:  {[key: string]: { input: HTMLInputElement }};
    private select: {};

    constructor(args: { container: HTMLDivElement; }) {
        super(args);

        this.questionType = "multianswer";
        const edits = this.container.querySelectorAll("span.subquestion > input") as HTMLInputElement[];
        const selects = this.container.querySelectorAll("span.subquestion > select");// as HTMLSelectElement[]
        const multichoices = this.container.querySelectorAll("div.answer, table.answer, fieldset.answer");

        const getSlot = (node: { name: string }) => node.name.match(/sub(\d+)/)[1];

        this.edit = {};
        this.select = {};
        this.multichoice = {};

        /* Shortanswer & numerical subquestion type */
        for (const input of edits) {
            this.edit[getSlot(input)] = {input};
        }

        /* Multichoice subquestion type */
        for (const mc of multichoices) {
            const inputs = mc.querySelectorAll("input[type=\"radio\"], input[type=\"checkbox\"]");

            const subQ = {
                options: {},
                answer: mc,
                type: inputs[0].type,
            } as MultichoiceSubquestion;

            for (const input of inputs) {
                const label = input.nextSibling;

                const sign = [
                    Strings.removeInvisible(label.lastChild.textContent) || "[NO TEXT]",
                    Images.serializeArray(label.querySelectorAll("img"))
                ];

                subQ.options[sign.join(";")] = input;
            }

            this.multichoice[getSlot(inputs[0])] = subQ;
        }

        /* Gap select subquestion type */
        for (const select of selects) {
            const subQ = {
                node: select,
                optionMap: {}
            }

            for (const option of select.childNodes) {
                if (!option.value)
                    continue;

                subQ.optionMap[option.innerText] = option.value;
            }

            this.select[getSlot(select)] = subQ;
        }
    }

    createWidgetAnchor(anchor: Anchor) {
        let subq = null;
        if ((subq = this.select[anchor.index])) {
            return createSelectAnchor(subq);
        }
        else if ((subq = this.multichoice[anchor.index])) {
            if (subq.type == "radio")
                return createMultichoiceRadioAnchor(anchor, subq.answer, subq.options);
            else if (subq.type == "checkbox")
                return createMultichoiceCheckboxAnchor(anchor, subq.answer, subq.options);
            return null;
        }
        else if ((subq = this.edit[anchor.index])) {
            return createShortanswerAnchor(anchor, subq.input);
        }
    }
}

export default Multianswer;