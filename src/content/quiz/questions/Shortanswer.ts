import Question from "../../../content/quiz/questions/Question"
import MagicButton from "../../../shared/widgets/MagicButton";
import {Anchor, WidgetAnchor} from "../solver/types";

export function createShortanswerAnchor(anchor: Anchor, tag: HTMLInputElement): WidgetAnchor {
    const button = new MagicButton().element;
    tag.parentNode.appendChild(button);

    const onClick = (data: string) => {
        tag.value = data;
    }

    return {onClick, button};
}

class Shortanswer extends Question {
    questionType: string;
    container: any;

    constructor(args) {
        super(args);
        this.questionType = "shortanswer";
    }

    createWidgetAnchor(anchor: Anchor): WidgetAnchor {
        return createShortanswerAnchor(anchor, this.container.querySelector("span.answer > input"));
    }
}

export default Shortanswer;