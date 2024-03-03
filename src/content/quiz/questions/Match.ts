import Question from "../../../content/quiz/questions/Question";
import * as Images from "../../../shared/utils/images";
import * as Strings from "../../../shared/utils/strings";
import MagicButton from "../../../shared/widgets/MagicButton";

class Match extends Question {
    labels: {};
    private options: {};
    container: any;
    questionType: string;

    constructor(args) {
        super(args);

        const table   = this.container.querySelector("table.answer");
        const stems   = table.querySelectorAll("td.text");
        const selects = table.querySelectorAll("td.control > select");

        this.labels  = {};
        this.options = {};
        this.questionType = "match";

        for (const option of selects[0].childNodes) {
            this.options[option.innerText] = option.value;
        }

        for (let i = 0; i < stems.length; i++) {
            const stem   = stems[i];
            const select = selects[i];

            let sign = [
                Strings.removeInvisible(stem.innerText) || "[NO TEXT]",
                Images.serializeArray(stem.querySelectorAll("img"))
            ];
            if(!sign[1])
                sign.pop();
            this.labels[sign.join(";")] = select;
        }
    }

    /** @param {string[]} anchor_list*/
    createWidgetAnchor(anchor_list) {
        const anchor = anchor_list[0];
        let select = this.labels[anchor];//.sign
        console.log('ancj', anchor, select);
        // Try to find similar nodes in case 
        // the text of the question has changed
        if (!select) {
            const candidate = Strings.findSimilar(anchor, Object.keys(this.labels));//.sign

            if (!candidate) {
                return;
            }

            select = this.labels[candidate];
        }

        const button = new MagicButton().element;
        select.parentNode.appendChild(button);

        const onClick = data => {
            let option = this.options[data];//.sign
            console.log('data',data);
            console.log('opt', option);
            // Try to find similar options in case 
            // the text of the question has changed
            if (!option) {
                const candidate = Strings.findSimilar(data, Object.keys(this.options));//.sign

                if (!candidate) {
                    return;
                }

                option = this.options[candidate];
            }

            select.value = option;
        };

        return { onClick, button };
    }
}

export default Match;