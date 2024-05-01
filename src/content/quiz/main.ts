import Log from "../../shared/debug/log";
import {QuizPage} from "./QuizPage";


const quizPage = new QuizPage();

// Check if page can be served
const pageMetadata = quizPage.meta;

if (!pageMetadata.quiz.id || !pageMetadata.attempt.id) {
    throw new Error("QuizPage: NotSupported: Missing required parameters");
}

Log.info("QuizPage: Check passed")

if (document.querySelector("#page-mod-quiz-review")) {
    Log.info("QuizPage: serving as a review");

    chrome.runtime.sendMessage({ //browser
        type: "review-page-open",
        payload: {
            quizId:    pageMetadata.quiz.id,
            attemptId: pageMetadata.attempt.id,
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
            quizId:    pageMetadata.quiz.id,
            attemptId: pageMetadata.attempt.id,
        }
    });

    try {
        quizPage.processAttempt();
    } catch (e) {
        Log.error(e, "Error occurred while serving quiz attempt page");
    }
}