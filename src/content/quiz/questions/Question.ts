import ContextMenu from "../../../shared/widgets/ContextMenu";
import {Anchor, Solution, Submenu, Submission} from "../solver/types";
import {calculateDelay} from "../solver/delayManager";
//import browser from "webextension-polyfill";
let autoclicker = true;

chrome.runtime.onMessage.addListener(req => { //browser
    if (req?.type !== "fwd-set-autoclicker")
        return;
    autoclicker = req.data
    console.log("current ac status:", autoclicker);
});

function submitTask() {
    let a = document.getElementById("mod_quiz-next-nav");
    let b = document.getElementsByClassName("mod_quiz-next-nav")[0] as HTMLElement;
    setTimeout(() => {
        // while (answered<totalAnswers){ (async ()=>await new Promise(f => setTimeout(f, 1000)))()}
        if (a)
            a.click();
        if (b)
            b.click();
    }, 1000);
}

function pickBestSubmission(submissions: Submission[]): Submission {
    let best = submissions[0];
    submissions.forEach(submission=>{
        if (submission.correctness > 0){
            if (best.count< submission.count){
                best=submission;
            }
        }
    })
    return best;
}

class Question {
    private qId: number;
    questionType: string;
    container: any;
    private name: Error;

    constructor({container}) {

        const postData = container.querySelector("input.questionflagpostdata").value;
        const url = new URL("a://a/a?" + postData);

        this.qId = parseInt(url.searchParams.get("qid"));
        //this.questionType="unspecified";
        /** @type {HTMLDivElement} */
        this.container = container;

    }

    // /**
    // * @typedef  SolutionItem Represents single menu option (or answer option)
    // * @type     {Object}
    // * @property {string} label String representation of answer option
    // * @property {Object} data  Question-specific data required to perform autofill
    // */

    //@property {SolutionItem} item        More detailed information about specific answer option


    /**
     * @callback AutoFill
     * @param    {Submenu} data Question-specific data required to perform autofill
     */

    /**
     * @typedef  WidgetAnchor Contains magic button and function to perform autofill
     * @type     {Object}
     * @property {HTMLElement}  button  Magic button DOM node
     * @property {AutoFill}     onClick Question-specific data required to perform autofill
     */



    /**
     * Handles retrieved solutions from server by rendering
     * magic button and appropriate menu options
     *
     * @param {Solution[]} solutions An array of solutions
     */
    handleSolutions(solutions: Solution[]) {
        function getColor(correctness) {

            // Default correctness - unknown
            const color = {
                backColor: undefined,
                textColor: undefined
            }

            switch (correctness) {
                // Incorrect
                case 0:
                    color.backColor = "#FAA0A0"; // Red #b81414
                    color.textColor = "#FFFFFF"; // White
                    break;

                // Partially correct
                case 1:
                    color.backColor = "#FAC898"; // Orange #e66815
                    color.textColor = "#FFFFFF"; // White
                    break;

                // Correct
                case 2:
                    color.backColor = "#A9D099"; // Green #369c14
                    color.textColor = "#FFFFFF"; // White
                    break;

                default:
                    color.backColor = "#cfcfc4"; // Gray
                    color.textColor = "#FFFFFF"; // White
                    break;
            }

            return color;
        }
        let totalAnswers = solutions.length;
        let answered = 0;
        let totalWait = 0;

        solutions?.forEach(solution => {
            const menuOptions: Submenu[] = [];
            const suggestions = solution.suggestions;
            const submissions = solution.submissions;
            const anchor: any = this.createWidgetAnchor(solution.anchor);

            if (!anchor)
                return;

            if (suggestions?.length > 0) {
                // totalAnswers++;
                /** @type Submenu */
                const suggMenu = {
                    label: chrome.i18n.getMessage("magicMenuSuggestions"), //browser
                    icon: {name: "fa-star-o"},
                    action: null,
                    data: null,
                    subMenu: []
                }
                suggestions.forEach(suggestion => {
                    //const item = suggestion.item;

                    suggMenu.subMenu.push({
                        label: suggestion.label,
                        data: suggestion.data,
                        icon: {
                            alignRight: true,
                            text: `${suggestion.confidence * 100}%`,
                            ...getColor(suggestion.correctness)
                        },
                        action: () => anchor.onClick(suggestion.data)

                    });
                });

                menuOptions.push(suggMenu);
            }

            if (submissions?.length > 0) {
                /** @type Submenu */
                const subsMenu = {
                    label: chrome.i18n.getMessage("magicMenuSubmissions"), //browser
                    icon: {name: "fa-bar-chart"},
                    action: null,
                    data: null,
                    subMenu: []
                }

                let bestAnswer = pickBestSubmission(submissions);
                submissions.forEach(submission => {
                    //const item = submission.item;

                    subsMenu.subMenu.push({
                        label: submission.label,
                        data: submission.data,
                        icon: {
                            alignRight: true,
                            text: submission.count.toString(),
                            ...getColor(submission.correctness)
                        },
                        action: () => anchor.onClick(submission.data)
                    });

                    if (autoclicker && submission == bestAnswer) {
                        const delay = calculateDelay(submissions);
                        totalWait += delay;
                        setTimeout(() => {
                            anchor.onClick(submission.data);
                            answered++;
                            if (answered == totalAnswers) {
                                submitTask();
                            }
                        }, totalWait);
                    }
                    chrome.storage.sync.get('autoclicker', function (data) {
                        if (data) {
                            autoclicker = data.autoclicker;
                        }
                    });


                });

                menuOptions.push(subsMenu);
            }
            const menu = new ContextMenu(menuOptions);
            menu.attach(anchor.button);
        });


    }

    /**
     * Creates magic button and defines function to autofill answer
     *
     * @param   {Anchor} anchor Question-specific signature to anchor magic button to specific element
     * @returns {WidgetAnchor}  Anchor containing created magic button and autofill function
     */
    createWidgetAnchor(anchor: Anchor) {
        throw `${this.name}: createWidgetAnchor must be overridden!`;
    }

}

export default Question;