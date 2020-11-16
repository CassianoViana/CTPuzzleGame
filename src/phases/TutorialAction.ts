import { Scene } from "phaser";
import TutorialHighlight from "./TutorialHighlight";

export default class TutorialAction {

    scene: Scene;
    highlights: Array<TutorialHighlight>;
    nextTutorialAction: TutorialAction
    previousTutorialAction: TutorialAction;
    onHighlight: () => void = () => { }
    onCompleteAction: () => void = () => { }
    isEnvironmentValidToHighlightTutorial: () => boolean = () => true
    triggered: boolean = false;
    index: number;
    onInvalidState: () => void
    isAllowedToHighlightNextTutorialStep: () => boolean = () => { return true };

    constructor(
        scene: Scene,
        highlights: Array<TutorialHighlight>,
    ) {
        this.scene = scene;
        this.highlights = highlights;
    }

    reset() {
        console.log('TUTORIAL_RESETING')
        this.triggered = false;
        this.highlights.forEach(highlight => {
            highlight.reset();
        })
        this.highlights = []
    }

    highlight() {
        if (this.triggered) return;
        if (this.isEnvironmentValidToHighlightTutorial()) {
            this.triggered = true;
            console.log('TUTORIAL_ACTION_INDEX highlight [index]', this.index)
            this.onHighlight();
            const onInteractAdvanceTutorial = () => {
                this.onCompleteAction();
                if (this.isAllowedToHighlightNextTutorialStep()) {
                    this.nextTutorialAction?.highlight();
                }
            }
            this.highlights.forEach(highlight => {
                highlight.onInteractAdvanceTutorial = () => onInteractAdvanceTutorial();
                highlight.contrastAndShowHandPointing();
            });
        }
        if (!this.isEnvironmentValidToHighlightTutorial()) {
            if (this.previousTutorialAction) {
                this.previousTutorialAction.triggered = false
                this.previousTutorialAction.highlight();
            } else {
                this.onInvalidState()
            }
        }
    }

}