import {BLHTTPResponseEvent} from '@notest/common';

export class HttpComparator {

  constructor() {
  }
  compareList(currentHttpEvents: BLHTTPResponseEvent[], previousHttpEvents: BLHTTPResponseEvent[]) {
    let checkPassed: boolean = true;
    let matchedEvents = 0;
    const totEvents = previousHttpEvents.length;
    console.log("ELEMENTI IN PIU",currentHttpEvents.filter((element)=>{
      let rem = false;
      const url1 = new URL(element.request.url)
      const a = url1.pathname+url1.search;
      for(const e of previousHttpEvents){
        const u2 = new URL(e.request.url)
        if(u2.pathname+u2.search == a){
          rem = true
        }
      }
      return rem == false;
    }));
    console.log("ORIGINAL HTTP EVENTS", previousHttpEvents.length)
    console.log("NEW HTTP EVENTS", currentHttpEvents.length)
    for (const currentHttpEvent of currentHttpEvents) {
      const {eventMatched,session} = this.findSimilarRequest(previousHttpEvents, currentHttpEvent);
      let similarRequest = eventMatched;
      previousHttpEvents = session;
      if(similarRequest){
        if(!this.compareStatusResponse(similarRequest, currentHttpEvent)){
          checkPassed = false;
        } else {
          matchedEvents ++;
        }
        console.log("remaining events", previousHttpEvents.length);
      }
    }
    console.log("MATCHED EVENTS", matchedEvents/totEvents*100)
    return checkPassed;
  }
  private compareStatusResponse(similarRequest: BLHTTPResponseEvent, currentHttpEvent: BLHTTPResponseEvent) {
    console.log("ORIGINAL STATUS ",similarRequest.request.method + " " + similarRequest.request.url, similarRequest.status);
    console.log("CURRENT STATUS ",currentHttpEvent.request.method + " " + currentHttpEvent.request.url, currentHttpEvent.status);
    return similarRequest.status === currentHttpEvent.status;
  }

  private findSimilarRequest(
    session: BLHTTPResponseEvent[],
    event: BLHTTPResponseEvent
  ){
    const eventFounded = session.find((e) => {
      //check if url is the same
      const iteratorEventUrl = new URL(e.request.url);
      const eventUrl = new URL(event.request.url);
      const urlIsTheSame = iteratorEventUrl.pathname === eventUrl.pathname;
      if (!urlIsTheSame) return false;
      //get url params of query requests
      const urlSearch = iteratorEventUrl.search;
      const urlSearch2 = eventUrl.search;
      return urlSearch.localeCompare(urlSearch2) === 0;

    });
    let eventMatched: undefined | BLHTTPResponseEvent = undefined;
    if(eventFounded){
      eventMatched = JSON.parse(JSON.stringify(eventFounded));
      session = session.filter((element)=>
        eventFounded != element
      )
    }
    return {eventMatched , session};
  }
}
