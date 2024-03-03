import Question from "../../../content/quiz/questions/Question"
import MagicButton from "../../../shared/widgets/MagicButton";

class Shortanswer extends Question {
    questionType: string;
    container: any;

    constructor(args) {
        super(args);
        this.questionType="shortanswer";
    }
    createWidgetAnchor(anchor) {

        const input = this.container.querySelector("span.answer > input");

        const button = new MagicButton();
        input.parentNode.appendChild(button.element);

        const onClick = (data) => {
            input.value = data.text;
            console.log("data:", data);
        }

        return { onClick, button };
    }
}

export default Shortanswer;