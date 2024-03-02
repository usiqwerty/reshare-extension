import logger from "shared/debug/log";
//import browser from "webextension-polyfill";

class QuizService {

    init(moodleId) {
        this.moodleId = moodleId;
        chrome.runtime.onMessage.addListener(data => { //browser
            if (data?.type !== "quiz-review-data")
                return;

            this.onReviewData(data.payload)
        });

        chrome.runtime.onMessage.addListener(data => { //browser
            if (data?.type !== "quiz-attempt-data")
                return;

            this.onAttemptData(data.payload);
        });

        chrome.runtime.onMessage.addListener((data, sender, sendResponse) => { //browser

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
        //console.log("the doc:", document);

        const question = {

            host: body.host,
            courseId: body.courseId,
            quizId: body.quizId,
            attemptId: body.attemptId,
            moodleId: body.moodleId,
            questionId: body.qId,
            questionType: body.questionType,
            client: '1.1.6',
        };
        console.log('got a q: ', question);

        //let xhr = new XMLHttpRequest();

        const api_url= "https://syncshare.naloaty.me/api/v2/";
        //quiz/solution?
        // host=exam1.urfu.ru
        // &courseId=857
        // &quizId=13650
        // &attemptId=3686611
        // &moodleId=455433
        // &questionId=17291537
        // &questionType=multianswer
        // &client=1.1.6

        //"http://127.0.0.1:8000/api/get_solution"; //"https://usiqwerty.pythonanywhere.com/api/get_solution"; //
        let request_url = api_url + "quiz/solution?" + new URLSearchParams(question).toString();
        fetch(request_url).then(r => r.text()).then(result => {
            let result_obj = JSON.parse(result);
            sendResponse(result_obj);//alert(result);
            console.log("Response sent");
        })

    }
}

export default QuizService;