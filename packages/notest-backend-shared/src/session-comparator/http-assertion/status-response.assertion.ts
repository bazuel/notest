import {BLHTTPResponseEvent} from "@notest/common"
import {FindSimilarRequestAssertion} from "./find-similar-request.assertion";
export class StatusResponseAssertion extends FindSimilarRequestAssertion{
    compare(request1: BLHTTPResponseEvent, request2: BLHTTPResponseEvent) {
        return request1.status === request2.status;
    }

}