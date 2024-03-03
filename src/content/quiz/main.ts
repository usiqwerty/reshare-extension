import TypeSelector from "../../content/quiz/questions/TypeSelector";
import Log from "../../shared/debug/log";
//import browser from "webextension-polyfill";
import MultiSource from "../../shared/utils/MultiSource";
import BreadcrumbSource from "./sources/BreadcrumbSource";
import LinkSource from "./sources/quiz/LinkSource";
import URLSource from "./sources/quiz/URLSource";

class QuizPage {
    meta: { quiz: { name: any; id: any }; host: any; course: { name: any; id: any }; attempt: { id: any } };
    private questions: any[];

    constructor() {
        const page = new MultiSource(
            new BreadcrumbSource(),
            new LinkSource(),
            new URLSource()
        );

        /**
         * @type     {Object}
         * @property {String} host
         * @property {Object} course
         * @property {number} course.id
         * @property {String} course.name
         * @property {Object} quiz
         * @property {number} quiz.id
         * @property {String} quiz.name
         * @property {Object} attempt
         * @property {number} attempt.id
         * */
        this.meta = {
            host: page.get("host"),
            course: {
                id:   page.get("courseId"),
                name: page.get("courseName")
            },
            quiz: {
                id: page.get("quizId"),
                name: page.get("quizName")
            },
            attempt: {
                id: page.get("attemptId")
            }
        }

        /** @type {Question[]} */
        this.questions = [];

        document.querySelectorAll("div.que").forEach((container)=>{
            const question = TypeSelector.select(container);

            if (question) {
                this.questions.push(question);
            }
        });

    }

    serializeQuestions() {
        const questionsHTML = [];

        for (const question of this.questions) {
            const html = question.container.outerHTML;

            /** 
             * Remove session key from HTML to ensure user account safety
             */
            questionsHTML.push(html.replaceAll(/sesskey=.+;/g, ""));
        }

        return questionsHTML;
    }

    processAttempt() {
        const body = {
            host:     this.meta.host,
            courseId: this.meta.course.id,
            quizId:   this.meta.quiz.id,
            qId:      -1
        }
        
        for (const question of this.questions) {
            //body.qId = question.qId;

            /* service/quiz */
            const data_userid = document.querySelector("[data-userid]");
            const moodleIdAsString = data_userid.getAttribute("data-userid");

            const sending = chrome.runtime.sendMessage({ //browser.runtime.sendMessage
                type: "solution-request",
                payload: {
                    moodleId: moodleIdAsString,
                    host:       this.meta.host,
                    courseId:   this.meta.course.id,
                    courseName: this.meta.course.name,
                    quizId:     this.meta.quiz.id,
                    quizName:   this.meta.quiz.name,
                    attemptId:  this.meta.attempt.id,
                    qId: question.qId,
                    questionType: question.questionType,
                    //questions:  this.serializeQuestions()
                }
            });

            console.log("sending:",sending);
            sending.then((solutions) => {
                if (solutions) {
                    console.log("Solution response received", solutions);
                    question.handleSolutions(solutions);
                }
            });
            sending.catch(e => Log.error(e, "Error during solution request", body))
        }
        
        window.addEventListener("beforeunload", e => {
            chrome.runtime.sendMessage({ //browser
                type: "quiz-attempt-data",
                payload: {
                    host:       this.meta.host,
                    courseId:   this.meta.course.id,
                    courseName: this.meta.course.name,
                    quizId:     this.meta.quiz.id,
                    quizName:   this.meta.quiz.name,
                    attemptId:  this.meta.attempt.id,
                    questions:  this.serializeQuestions()
                }
            });
        });
    }

    processReview() {
        chrome.runtime.sendMessage({ //browser
            type: "quiz-review-data",
            payload: {
                host:       this.meta.host,
                courseId:   this.meta.course.id,
                courseName: this.meta.course.name,
                quizId:     this.meta.quiz.id,
                quizName:   this.meta.quiz.name,
                attemptId:  this.meta.attempt.id,
                questions:  this.serializeQuestions()
            }
        });
    }
}


const quizPage = new QuizPage();

// Check if page can be served
const m = quizPage.meta;

if (!m.quiz.id || !m.attempt.id) {
    throw new Error("QuizPage: NotSupported: Missing required parameters");
}

Log.info("QuizPage: Check passed")


if (document.querySelector("#page-mod-quiz-review")) {
    Log.info("QuizPage: serving as a review");

    chrome.runtime.sendMessage({ //browser
        type: "review-page-open",
        payload: {
            quizId:    m.quiz.id,
            attemptId: m.attempt.id,
        }
    });

    try {
        quizPage.processReview();
    } catch (e) {
        Log.error(e, "Error occurred while serving quiz review page");
    }
}
else {
    Log.info("QuizPage: serving as an attempt");

    chrome.runtime.sendMessage({ //browser
        type: "attempt-page-open",
        payload: {
            quizId:    m.quiz.id,
            attemptId: m.attempt.id,
        }
    });

    try {
        quizPage.processAttempt();
    } catch (e) {
        Log.error(e, "Error occurred while serving quiz attempt page");
    }
}