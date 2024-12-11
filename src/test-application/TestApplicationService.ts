import { RespostaItemProgramacao } from "../ct-platform-classes/RespostaItemProgramacao";
import { Logger } from "../main";
import GameParams from "../settings/GameParams";
import User from "../user/User";
import { GET, POST, PUT } from "../utils/internet";
import { getItem, getTypedItem, setItem } from "../utils/storage";
import { getDefaultPlatformApiUrl, isAndroidAmbient, replaceUserUuidTokenByUserHash, USER_UUID_TOKEN } from "../utils/Utils";
import { PreparedParticipation, TestApplication, TestItem, UrlToSendProgress } from "./TestApplication";

export default class TestApplicationService {

  async disableQuiz() {
    const participation = this.getParticipation()
    if (participation) {
      participation.urlToEndOfTestQuiz.url = null
      this.setParticipation(participation);
    }
  }

  constructor(private gameParams: GameParams) {
    Logger.info('LOADED GAME PARAMS', gameParams)
    setItem("gameParams", gameParams)
  }

  isTestApplication() {
    return this.getGameParams()?.isTestApplication()
  }

  isAutoTesting() {
    return this.getGameParams().isAutomaticTesting()
  }

  isPlayground() {
    return this.getGameParams()?.isPlaygroundTest()
  }

  getPublicTestApplications(): TestApplication[] {
    return getItem('public-test-applications') as TestApplication[]
  }

  getGameParams(): GameParams {
    return getTypedItem(GameParams, 'gameParams');
  }

  getCurrentPhaseString(testItemId: number): string {
    const participation = this.getParticipation();
    let phaseString = '';
    if (participation) {
      const items = participation?.test?.items;
      if (items) {
        let item = items.find(item => item.id == testItemId)
        if (item) {
          const currentIndex = items.indexOf(item);
          if (currentIndex > -1) {
            phaseString = `Fase ${currentIndex + 1}/${items.length}`;
          }
        }
      }
    }
    return phaseString;
  }

  getParticipation(): PreparedParticipation {
    return getTypedItem(PreparedParticipation, "participation")
  }

  getNonCompletedTestItems(): TestItem[] {
    const participation = this.getParticipation()
    const items = participation.test.items;
    const lastVisitedItemId = participation.lastVisitedItemId;
    const lastVisitedItem = items.find((testItem) => testItem.id == lastVisitedItemId);
    const lastVisitedItemIndex = items.indexOf(lastVisitedItem);
    let nonCompletedItems = items
    if (lastVisitedItemIndex != -1) {
      nonCompletedItems = items.slice(lastVisitedItemIndex)
    }
    if (lastVisitedItemId == -1) {
      nonCompletedItems = []
    }
    return nonCompletedItems;
  }

  async saveUserSource() {
    if (this.gameParams.isTestApplication()) {
      let part = this.getParticipation()
      PUT(part.urlToSendSource?.url, {
        participationId: part.participationId,
        source: `(${isAndroidAmbient() ? "MOBILE" : (document?.referrer) + " COMPUTADOR"})`
      })
    }
  }

  async saveCurrentPlayingPhase(itemId: number) {
    let part = this.getParticipation()
    let participationId = part.participationId
    let urlToSendProgress: UrlToSendProgress = part.urlToSendProgress
    if (urlToSendProgress) {
      if (this.gameParams.isTestApplication()) {
        setItem('currentPlayingPhase', itemId + '');
        let participation = {
          id: participationId,
          lastVisitedItemId: itemId
        }
        PUT(urlToSendProgress.url, participation)
      }
    }
  }

  async loadPublicApplications(): Promise<TestApplication[]> {
    let url = getDefaultPlatformApiUrl(this.gameParams)
    let testApplications = []
    try {
      let name = 'PROGRAMAÇÃO ROPE'
      let response = await GET(`${url}/test-applications/public/getPuplicApplicationsByMechanicName/${name}`)
      testApplications = await response.json()
    } catch (e) {
      Logger.error('Did not succeded on load public test applications from ', url)
    }
    return testApplications
  }

  setTestApplications(testApplications: TestApplication[]) {
    setItem('public-test-applications', testApplications);
  }

  async loadApplicationFromDataUrl(user: User) {
    try {
      let urlToGetTestApplication = this.gameParams.dataUrl;
      const urlAlreadyHasUserHash = /.*\/data\/[\w-]+\/[\w-]+/.test(this.gameParams.dataUrl);
      if (!urlAlreadyHasUserHash) {
        urlToGetTestApplication = replaceUserUuidTokenByUserHash(this.gameParams.dataUrl, user.hash)
      }
      let response = await GET(urlToGetTestApplication)
      let participation = (await response.json()) as PreparedParticipation
      this.setParticipation(participation)
    } catch (e) {
      Logger.error(e);
    }
  }

  setParticipation(participation: PreparedParticipation) {
    setItem("participation", participation)
  }

  async sendResponse(responseToSend: { itemId: number, response: RespostaItemProgramacao }) {
    let urlToSendResponses = this.getParticipation().urlToSendResponses
    if (urlToSendResponses) {
      let url = urlToSendResponses.url;
      Logger.info('sendResponse: url', url)
      url = url.replace('<item_id>', responseToSend.itemId + '');
      Logger.info('sendResponse: url', url)
      console.log('sendResponse: response', JSON.stringify(responseToSend.response))
      Logger.info('sendResponse: response', JSON.stringify(responseToSend.response))
      await POST(url, responseToSend.response);
    }
  }

  async instantiatePlaygroundItem<T>(): Promise<T> {
    const response = await GET(this.gameParams.urlToInstantiateItem);
    let item = await response.json();
    return item as T;
  }
}
