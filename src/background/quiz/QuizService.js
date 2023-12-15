import logger from "shared/debug/log";
import browser from "webextension-polyfill";

class QuizService {

    init(moodleId) {
        this.moodleId = moodleId;
        browser.runtime.onMessage.addListener(data => {
            if (data?.type !== "quiz-review-data")
                return;

            this.onReviewData(data.payload)
        });

        browser.runtime.onMessage.addListener(data => {
            if (data?.type !== "quiz-attempt-data")
                return;

            this.onAttemptData(data.payload);
        });

        browser.runtime.onMessage.addListener((data, sender, sendResponse) => {

            if (data?.type !== "solution-request")
                return true;
            //console.log("sol req listener:", data, sender, sendResponse);
            this.onSolutionRequest(data.payload, sendResponse);
            return true;
        });

        logger.info("QuizService: initialized");

    }

    onReviewData(data) {
        console.log("Review data received");
    }

    onAttemptData(data) {
        console.log("Attempt data received", data);
    }

    onSolutionRequest(body, sendResponse) {
        console.log("Solution request received", body);
        //
        console.log("the doc:", document);

        const i = {

            host: body.host,
            courseId: body.courseId,
            quizId: body.quizId,
            attemptId: body.attemptId,
            moodleId: body.moodleId,
            questionId: body.qId,
            questionType: body.questionType,
        };
        console.log('got a q: ', i);

        //let xhr = new XMLHttpRequest();

        const api_url="http://127.0.0.1:8000/api/get_solution";
        let request_url = api_url + "?" + new URLSearchParams(i).toString();
        fetch(request_url).then(r => r.text()).then(result => {
            let result_obj = JSON.parse(result);
            sendResponse(result_obj);//alert(result);
            console.log("Response sent");
        })

    }
}

export default QuizService;