import Question from "./questions/Question";
import MultiSource from "../../shared/utils/MultiSource";
import BreadcrumbSource from "./sources/BreadcrumbSource";
import LinkSource from "./sources/quiz/LinkSource";
import URLSource from "./sources/quiz/URLSource";
import TypeSelector from "./questions/TypeSelector";
import Log from "../../shared/debug/log";
import {Solution} from "./solver/types";

export class QuizPage {
    meta: {
        quiz: { name: string; id: number };
        host: string;
        course: { name: string; id: number };
        attempt: { id: number }
    };
    private readonly questions: Question[];
    autoclicker: boolean;

    constructor() {
        const page = new MultiSource(
            [new BreadcrumbSource(),
                new LinkSource(),
                new URLSource()]
        );


        this.meta = {
            host: page.get("host"),
            course: {
                id: page.get("courseId"),
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


        this.questions = [];

        document.querySelectorAll("div.que").forEach((container: HTMLDivElement) => {
            const question = TypeSelector.select(container);

            if (question) {
                this.questions.push(question);
            }
        });

        this.autoclicker = false;
        chrome.runtime.sendMessage({type :"get-ac-status"}).then(r=>{
            if (r) {
                console.log("Set autoclicker to " + r);
                this.autoclicker = r;
            }
            else{
                console.error("Biba! get-ac-status gave no response");
            }
        }).catch(e=>{console.log("get-ac-status catch{}",e)})
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
            host: this.meta.host,
            courseId: this.meta.course.id,
            quizId: this.meta.quiz.id,
            qId: -1
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
                    host: this.meta.host,
                    courseId: this.meta.course.id,
                    courseName: this.meta.course.name,
                    quizId: this.meta.quiz.id,
                    quizName: this.meta.quiz.name,
                    attemptId: this.meta.attempt.id,
                    qId: question.qId,
                    questionType: question.questionType,
                    //questions:  this.serializeQuestions()
                }
            });



            console.log("sending:", sending);
            sending.then((solutions:Solution[]) => {
                if (solutions) {
                    console.log("Solution response received", solutions);
                    question.handleSolutions(solutions);

                    if (this.autoclicker){
                        console.log("autoclickEverything");
                        solutions.forEach((solution, i)=>{
                            question.clickAnswer(solution.submissions, question.widgetAnchors[i]);
                        })
                    }

                }
            });
            sending.catch(e => Log.error(e, "Error during solution request", body))
        }

        window.addEventListener("beforeunload", () => {
            chrome.runtime.sendMessage({ //browser
                type: "quiz-attempt-data",
                payload: {
                    host: this.meta.host,
                    courseId: this.meta.course.id,
                    courseName: this.meta.course.name,
                    quizId: this.meta.quiz.id,
                    quizName: this.meta.quiz.name,
                    attemptId: this.meta.attempt.id,
                    questions: this.serializeQuestions()
                }
            });
        });
    }

    processReview() {
        chrome.runtime.sendMessage({ //browser
            type: "quiz-review-data",
            payload: {
                host: this.meta.host,
                courseId: this.meta.course.id,
                courseName: this.meta.course.name,
                quizId: this.meta.quiz.id,
                quizName: this.meta.quiz.name,
                attemptId: this.meta.attempt.id,
                questions: this.serializeQuestions()
            }
        });
    }
}