import Question from "../../../content/quiz/questions/Question"
import MagicButton from "../../../shared/widgets/MagicButton";
import {WidgetAnchor} from "../solver/types";

class Shortanswer extends Question {
    questionType: string;
    container: any;

    constructor(args) {
        super(args);
        this.questionType = "shortanswer";
    }

    createWidgetAnchor(anchor): WidgetAnchor {

        const input = this.container.querySelector("span.answer > input");

        const button = new MagicButton().element;
        input.parentNode.appendChild(button);

        const onClick = (data: string) => {
            input.value = data;
        }

        // @ts-ignore
        return {onClick, button};
    }
}

export default Shortanswer;