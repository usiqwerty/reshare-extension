import ContextMenu from "../../../shared/widgets/ContextMenu";
import {Anchor, Solution, Submenu, Submission, Suggestion, WidgetAnchor} from "../solver/types";
import {calculateDelay} from "../solver/delayManager";
import {getColor} from "../../../shared/utils/color";
let autoclicker = false;

chrome.runtime.sendMessage({type:"autoclicker-status"});
chrome.runtime.onMessage.addListener(req => { //browser
    if (req?.type !== "status-set-autoclicker")
        return;
    // autoclicker = req.data
    autoclicker = req.data;
    console.log("ac status:", autoclicker);
});

chrome.runtime.onMessage.addListener(req => { //browser
    if (req?.type !== "fwd-set-autoclicker")
        return;
    autoclicker = req.data;
    alert("Автокликер "+ (autoclicker? "включён":"выключен")+". Перезагрузите страницу");
    console.log("current ac status:", autoclicker);
});


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
    qId: number;
    questionType: string;
    container: HTMLDivElement;
    private name: Error;
    private totalWait: number;
    private totalAnswers: number;
    private answered: number;

    constructor({container}) {

        const postData = container.querySelector("input.questionflagpostdata").value;
        const url = new URL("a://a/a?" + postData);

        this.qId = parseInt(url.searchParams.get("qid"));
        //this.questionType="unspecified";

        this.container = container;

    }
    trySubmitTask() {
        this.answered++;
        if (this.answered == this.totalAnswers) {
            console.log('trySubmitTask()');
            let a = document.getElementById("mod_quiz-next-nav");
            let b = document.getElementsByClassName("mod_quiz-next-nav")[0] as HTMLElement;
            setTimeout(() => {
                if (a)
                    a.click();
                if (b)
                    b.click();
            }, 1000);
        }
    }

    /**
     * Handles retrieved solutions from server by rendering
     * magic button and appropriate menu options
     *
     * @param {Solution[]} solutions An array of solutions
     */
    handleSolutions(solutions: Solution[]) {

        this.totalAnswers = solutions.length;
        this.answered = 0;
        this.totalWait = 0;

        solutions?.forEach(solution => {
            const menuOptions: Submenu[] = [];
            const anchor = this.createWidgetAnchor(solution.anchor);
            // if (!anchor)
            //     return;

            this.parseSuggestions(solution.suggestions, anchor, menuOptions);
            this.parseSubmissions(solution.submissions, anchor, menuOptions);
            if (autoclicker)
                this.clickAnswer(solution.submissions, anchor);
            const menu = new ContextMenu(menuOptions);
            menu.attach(anchor.button);
        });


    }
    private clickAnswer(submissions: Submission[], anchor: any){
        const best = pickBestSubmission(submissions);
        const delay = calculateDelay(submissions);
        this.totalWait += delay;
        setTimeout(() => {
            anchor.onClick(best.data);
            this.trySubmitTask();
        }, this.totalWait);

        chrome.storage.sync.get('autoclicker', function (data) {
            if (data) {
                autoclicker = data.autoclicker;
            }
        });
    }
    private parseSubmissions(submissions: Submission[], anchor: any, menuOptions: Submenu[]) {
        if (submissions?.length > 0) {
            const subsMenu: Submenu = {
                label: chrome.i18n.getMessage("magicMenuSubmissions"), //browser
                icon: {name: "fa-bar-chart"},
                action: null,
                data: null,
                subMenu: []
            }

            submissions.forEach(submission => {
                subsMenu.subMenu.push({
                    label: submission.label,
                    data: submission.data,
                    icon: {
                        alignRight: true,
                        text: submission.count.toString(),
                        ...getColor(submission.correctness)
                    },
                    action: () => anchor.onClick(submission.data)
                } as Submenu);
            });

            menuOptions.push(subsMenu);
        }
    }

    private parseSuggestions(suggestions: Suggestion[], anchor: any, menuOptions: Submenu[]) {
        if (suggestions?.length > 0) {
            const suggMenu: Submenu = {
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

                } as Submenu);
            });

            menuOptions.push(suggMenu);
        }
    }

    createWidgetAnchor(anchor: Anchor | string[]): WidgetAnchor {
        /**
         * Creates magic button and defines function to autofill answer
         *
         * @param   {} anchor Question-specific signature to anchor magic button to specific element
         * @returns {} WidgetAnchor containing created magic button and autofill function
         */
        throw `${this.name}: createWidgetAnchor must be overridden!`;
    }

}

export default Question;