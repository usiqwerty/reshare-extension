import logger from "../../shared/debug/log";

const api_server = "syncshare.naloaty.me";

class QuizService {
    autoclicker: boolean;

    init() {
        chrome.runtime.onMessage.addListener(data => {
            if (data?.type !== "quiz-review-data")
                return;
            this.onReviewData(data.payload)
        });

        chrome.runtime.onMessage.addListener(data => {
            if (data?.type !== "quiz-attempt-data")
                return;
            this.onAttemptData(data.payload);
        });

        chrome.runtime.onMessage.addListener((data, sender, sendResponse) => {
            if (data?.type === "solution-request")
                this.onSolutionRequest(data.payload, sendResponse);
            return true;
        });

        chrome.storage.local.get(d => {
                const r = d.autoclicker;
                console.log("Initial ac set:", r);
                if (r)
                    this.autoclicker = r;
                else {
                    console.log("AC was not set, so saving default value");
                    this.autoclicker = false;
                    chrome.storage.local.set({autoclicker: false});
                }
            }
        );

        chrome.runtime.onMessage.addListener((data, sender, sendResponse) => {
            console.log("AC request:", data, this.autoclicker);
            if (data?.type === "get-ac-status")
                sendResponse(this.autoclicker);
            else if (data?.type === "set-ac-status")
                this.autoclicker = data.data;
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


        const api_url = "https://" + api_server + "/api/v2/";

        let request_url = api_url + "quiz/solution?" + new URLSearchParams(question).toString();
        fetch(request_url).then(r => r.text()).then(result => {
            let result_obj = JSON.parse(result);
            sendResponse(result_obj);
            console.log("Response sent");
        })

    }
}

export default QuizService;