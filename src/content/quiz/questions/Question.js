import ContextMenu from "shared/widgets/ContextMenu";
//import browser from "webextension-polyfill";
let autoclicker = false;

chrome.runtime.onMessage.addListener(req => { //browser
    if (req?.type !== "fwd-set-autoclicker")
        return;
    autoclicker=req.data
    console.log("current ac status:", autoclicker);
});

class Question {

    constructor({container}) {

        const postData = container.querySelector("input.questionflagpostdata").value;
        const url = new URL("a://a/a?" + postData);

        this.qId = parseInt(url.searchParams.get("qid"));
        this.questionType="unspecified";
        /** @type {HTMLDivElement} */
        this.container = container;

    }

    // /**
    // * @typedef  SolutionItem Represents single menu option (or answer option)
    // * @type     {Object}
    // * @property {string} label String representation of answer option
    // * @property {Object} data  Question-specific data required to perform autofill
    // */

    /**
    * @typedef Anchor
    * @type {Object}
    * @property {number} index
     * @property {string} __type
     * @property {string} anchor
    */

    /**
    * @typedef  Suggestion Contains SyncShare assumptions about correctness of certain answer options 
    * @type     {Object}
    * @property {number}       correctness Whether specific answer is correct / partially correct / incorrect
    * @property {number}       confidence  Confidence from 0 to 1 about specific assumption
    * @property {string} label String representation of answer option
    * @property {Object} data  Question-specific data required to perform autofill
    */
    //@property {SolutionItem} item        More detailed information about specific answer option
    /**
    * @typedef  Submission Contains data about other users submissions
    * @type     {Object}
    * @property {number}       correctness Whether specific answer is correct / partially correct / incorrect
    * @property {number}       count       How many times other users have chosen specific answer
    * @property {string} label String representation of answer option
    * @property {Object} data  Question-specific data required to perform autofill
    //* @property {SolutionItem} item        More detailed information about specific answer option
    */

    /**
    * @typedef  Solution Contains data to display one magic wand and difine its menu
    * @type     {Object}
    * @property {Anchor}       anchor      Question-specific signature to anchor magic button to specific element
    * @property {Suggestion[]} suggestions An array of suggestions
    * @property {Submission[]} submissions An array of submissions
    */

    /**
    * @callback AutoFill
    * @param    {Object} data Question-specific data required to perform autofill 
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
    handleSolutions(solutions) {
        function getColor(correctness) {

            // Default correctness - unknown
            const color = {}

            switch(correctness) {
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

        solutions?.forEach(solution => {
            const menuOptions = [];
            const suggestions = solution.suggestions;
            const submissions = solution.submissions;
            const anchor = this.createWidgetAnchor(solution.anchor);

            console.log('sol:', solution);
            console.log('archor', anchor);
            if (!anchor)
                return;

            if (suggestions?.length > 0) {
                const suggMenu = {
                    label: chrome.i18n.getMessage("magicMenuSuggestions"), //browser
                    icon: { name: "fa-star-o" },
                    action: null,
                    subMenu: []
                }

                suggestions.forEach(suggestion => {
                    //const item = suggestion.item;

                    suggMenu.subMenu.push({
                        label: suggestion.label,
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
                const subsMenu = {
                    label: chrome.i18n.getMessage("magicMenuSubmissions"), //browser
                    icon: { name: "fa-bar-chart" },
                    action: null,
                    subMenu: []
                }

                submissions.forEach(submission => {
                    //const item = submission.item;

                    subsMenu.subMenu.push({
                        label: submission.label,
                        icon: {
                            alignRight: true,
                            text: submission.count.toString(),
                            ...getColor(submission.correctness)
                        },
                        action: () => anchor.onClick(submission.data)
                    });
                    chrome.storage.sync.get('autoclicker', function(data) {
                        if (data){
                            autoclicker = data.autoclicker;
                        }
                        if (autoclicker && submission.correctness>0) {
                            const del = Math.random();
                            console.log('delay:', del);
                            setTimeout(() => {
                                anchor.onClick(submission.data);
                            }, 1000*10*del);

                            let a = document.getElementById("mod_quiz-next-nav");
                            let b = document.getElementsByClassName("mod_quiz-next-nav")[0];
                            setTimeout(() => {
                                a.click();
                            }, 1000);
                            setTimeout(() => {
                                b.click();
                            }, 1000);
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
    createWidgetAnchor(anchor) {
        throw `${this.name}: createWidgetAnchor must be overridden!`;
    }

}

export default Question;