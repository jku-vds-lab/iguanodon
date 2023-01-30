import { isSurvey } from ".";
import { gameEndReason } from "./GameBoard";

export interface IAttemptTrackData {
  userId: string;
  gameId: number;
  attempt: number;
  startTimestamp: Date;
  startActions: {
      actionId: string,
      value: boolean
  }[],
  actionChanges: {
      actionId: string,
      oldValue: boolean,
      newValue: boolean,
      timestamp: Date
  }[],
  confirmTimestamp: Date;
  confirmActions: {
      actionId: string,
      value: boolean
  }[],
  win: boolean
}

export interface IGameTrackData {
  userId: string;
  gameId: string;
  gameNumber: number;
  startTimestamp: Date;
  gameEndReason: gameEndReason;
  allAttempts: IAttemptTrackData[]
}

export interface IUserTrackData {
  userId: string;
  games: IGameTrackData[]
}

export async function postJSONAttemptData(filename: string, data: IAttemptTrackData) {

  const postURL = "https://save-json.caleydoapp.org/";
  console.log("🚀 ~ file: REST.ts ~ line 34 ~ postJSONAttemptData ~ postURL", postURL)
  const payload = {
    filename,
    data
  };
  // console.log("🚀 ~ file: REST.ts ~ line 35 ~ postJSONAttemptData ~ payload", payload)

  // const response = await fetch(postURL, {
  //   method: "POST",
  //   body: JSON.stringify(payload),
  //   headers: {
  //     "Content-Type": "application/json"
  //   }
  // })
  // console.log("🚀 ~ file: REST.ts ~ line 41 ~ postAttempt ~ response", response);
}

export async function postJSONGameData(filename: string, data: IGameTrackData) {

  const postURL = "https://save-json.caleydoapp.org/";
  const payload = {
    filename,
    data
  };
  // console.log("🚀 ~ file: REST.ts ~ line 54 ~ postJSONGameData ~ payload", payload)
 

  // const response = await fetch(postURL, {
    // method: "POST",
    // body: JSON.stringify(payload),
    // headers: {
    //   "Content-Type": "application/json"
    // }
  // })
  // console.log("🚀 ~ file: REST.ts ~ line 41 ~ postAttempt ~ response", response);
}

export async function postJSONUserData(filename: string, data: IUserTrackData) {

  const postURL = "https://save-json.caleydoapp.org/";
  const payload = {
    filename,
    data
  };
  // console.log("🚀 ~ file: REST.ts ~ line 54 ~ postJSONGameData ~ payload", payload)
 
  if(isSurvey) {
    const response = await fetch(postURL, {
      method: "POST",
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(payload)
    });
    // console.log("🚀 ~ file: REST.ts ~ line 41 ~ postAttempt ~ response", response);
  }
}