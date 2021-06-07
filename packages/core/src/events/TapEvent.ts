import { global } from '../utils/global';
import { matches } from '../utils/matches';

const isIE = (/Trident/g).test(navigator.userAgent);

type Global = typeof global;
type TapSupport = { ontap: unknown; ontapstart: unknown; ontapend: unknown };
type Positions = { pageX: number; pageY: number; screenX: number; screenY: number; clientX: number; clientY: number };
type MetaKeys = { altKey: boolean; ctrlKey: boolean; metaKey: boolean; shiftKey: boolean };

let positions: Positions;
let metaKeys: MetaKeys | undefined;

export class TapEvent extends Event {

  public pageX = 0;
  public pageY = 0;
  public screenX = 0;
  public screenY = 0;
  public clientX = 0;
  public clientY = 0;
  public altKey = false;
  public ctrlKey = false;
  public metaKey = false;
  public shiftKey = false;

  constructor (type: string, eventInitDict?: EventInit) {
    super(type, eventInitDict);
    if (positions) {
      this.pageX = positions.pageX;
      this.pageY = positions.pageY;
      this.screenX = positions.screenX;
      this.screenY = positions.screenY;
      this.clientX = positions.clientX;
      this.clientY = positions.clientY;
    }
    if (metaKeys) {
      this.altKey = metaKeys.altKey;
      this.ctrlKey = metaKeys.ctrlKey;
      this.metaKey = metaKeys.metaKey;
      this.shiftKey = metaKeys.shiftKey;
    }
  }
}

/**
 * checks if click event is generated by pressing `space` or `enter` on a button
 * @param event click event for checking
 * @return true if event was generated by pressing `space` or `enter` on a button
 */
const isButtonEnterOrSpace = (event: MouseEvent | PointerEvent): boolean => {
  return isIE && event instanceof PointerEvent ? false : event.detail === 0;
};

/**
 * Run click event if role='button'
 * @param event Enter or Spacebar keyboard event
 * @returns {void}
 */
const onEnterOrSpacebar = (event: KeyboardEvent): void => {
  const tapTarget = [...event.composedPath()][0];

  // Matches is split because IE11 does not support `:not(input[type=button])` selector
  if (tapTarget instanceof HTMLElement
    && matches(tapTarget, '[role=button]')
    && !matches(tapTarget, 'button,a,input[type=button],input[type=submit]')) {
    event.preventDefault();
    tapTarget.click();
  }
};

/**
 * Applies tap events to global
 * @param target globalThis or window object
 * @returns {void}
 */
const applyEvent = (target: Global): void => {

  /**
   * Should fire `tap` events.
   * This could be false if another library has added this feature.
   */
  const onTap = !('ontap' in target);

  /**
   * Should fire `tapend` events.
   * This could be false if another library has added this feature.
   */
  const onTapEnd = !('ontapend' in target);

  /**
   * Should fire `tapstart` events.
   * This could be false if another library has added this feature.
   */
  const onTapStart = !('ontapstart' in target);

  /**
   * If we can't fire any events,
   * don't bother to add logic.
   */
  if (!onTap && !onTapEnd && !onTapStart) {
    return;
  }

  /**
   * The starting touch point.
   * This is the most recent `touchstart`.
   */
  let startTouch: Touch | null;

  /**
   * The current touch identifier.
   * This is used to keep track of the current touch point,
   * when multiple touches are discovered.
   */
  let currentTouch = -1;

  /**
   * The last tap event target.
   * This is used to filter out duplicate tap events,
   * when a natural click event is fired.
   */
  let lastTapTarget: EventTarget | null;

  /**
   * Stored event path from `mousestart` event.
   * Used to match correct tap target.
   */
  let mouseEventPath: EventTarget[] = [];

  /**
   * Stored event path from `touchstart` event.
   * Used to match correct tap target.
   */
  let touchEventPath: EventTarget[] = [];

  /**
   * Dispatches a tap event on the current tap target
   * @param type event type
   * @param target event target
   * @param info event information
   * @returns {void}
   */
  const dispatchTapOnTarget = (type: string, target: EventTarget, info: MouseEvent | Touch): void => {
    const { pageX, pageY, screenX, screenY, clientX, clientY } = info;
    positions = { pageX, pageY, screenX, screenY, clientX, clientY };

    if (info instanceof MouseEvent) {
      const { altKey, ctrlKey, shiftKey, metaKey } = info;
      metaKeys = { altKey, ctrlKey, shiftKey, metaKey };
    }
    else {
      metaKeys = undefined;
    }

    const tapEvent = new TapEvent(type, {
      bubbles: true,
      composed: true,
      cancelable: true
    });

    target.dispatchEvent(tapEvent);

    if (tapEvent.defaultPrevented && info instanceof Event) {
      info.preventDefault();
    }
  };

  /**
   * Listen to `mousedown` events on the target.
   * Use this to fire tap events, unless one
   * has already been triggered from a touch event.
   */
  target.addEventListener('mousedown', (event) => {
    if (!lastTapTarget && event.target && currentTouch === -1) {
      mouseEventPath = [...event.composedPath()];

      const tapTarget = mouseEventPath[0];

      if (tapTarget) {
        onTapStart && dispatchTapOnTarget('tapstart', tapTarget, event);
      }
    }
  }, true);

  /**
   * Listen to `mouseup` events on the target.
   * Use this to fire tap events, unless one
   * has already been triggered from a touch event.
   */
  target.addEventListener('mouseup', (event) => {
    if (lastTapTarget) {
      /**
       * Tap events have been dispatched,
       * so rest and return.
       */
      lastTapTarget = null;
      return;
    }

    const path = [...event.composedPath()];

    const tapEndTarget = path[0];

    if (tapEndTarget) {
      onTapEnd && dispatchTapOnTarget('tapend', tapEndTarget, event);
    }

    if (!onTap) {
      return;
    }

    if (mouseEventPath.length < path.length) {
      path.splice(0, path.length - mouseEventPath.length);
    }
    else if (mouseEventPath.length > path.length) {
      mouseEventPath.splice(0, mouseEventPath.length - path.length);
    }

    /**
     * find closest shared NODE_ELEMENT for branches of mousedown and mouseup composedPaths to fire `tap` event
     */
    for (let i = 0; i < mouseEventPath.length - 1; i += 1) {
      if (mouseEventPath[i] === path[i] && (path[i] as Node).nodeType === Node.ELEMENT_NODE) {
        const tapTarget = mouseEventPath[i];
        dispatchTapOnTarget('tap', tapTarget, event);
        break;
      }
    }
  }, true);

  /**
   * Listen to `touchstart` events
   * to get the initial touch information.
   * Also fires a tapstart event.
   */
  target.addEventListener('touchstart', (event) => {
    startTouch = event.changedTouches[0];
    currentTouch = startTouch.identifier;
    touchEventPath = [...event.composedPath()];

    const tapTarget = touchEventPath[0];

    if (tapTarget) {
      onTapStart && dispatchTapOnTarget('tapstart', tapTarget, startTouch);
    }
  }, true);

  /**
   * Listen to `touchmove` events and cancel any tap event.
   * A `touchmove` event is only fired after threshold has been reached.
   * This keeps it consistent with standard `click` events on touch devices.
   */
  target.addEventListener('touchmove', () => {
    currentTouch = -1;
  }, true);

  /**
   * Listen to `touchend` events.
   * Fire tapend event and check whether
   * a tap event can also be fired.
   */
  target.addEventListener('touchend', (event) => {
    try {
      const touch = event.changedTouches[0];
      const path = [...event.composedPath()];

      if (touchEventPath.length < path.length) {
        path.splice(0, path.length - touchEventPath.length);
      }

      const tapTarget = path[0];

      if (tapTarget) {
        onTapEnd && dispatchTapOnTarget('tapend', tapTarget, touch);
      }

      if (tapTarget && touch.identifier === currentTouch) {
        lastTapTarget = tapTarget;
        onTap && dispatchTapOnTarget('tap', tapTarget, touch);
      }
    }
    finally {
      currentTouch = -1;
    }
  }, true);

  /**
   * Listen to `click` events on the target.
   * Use this to fire tap events, if `enter` or `space` was pressed on button
   */
  target.addEventListener('click', (event: MouseEvent | PointerEvent) => {
    if (isButtonEnterOrSpace(event)) {
      const path = [...event.composedPath()];
      const tapTarget = path[0];

      onTap && dispatchTapOnTarget('tap', tapTarget, event);
    }
  }, true);

  /**
   * Listen to `keyup` event on the target
   * Use this to fire tap event, if `enter` or `space` is clicked
   */
  target.addEventListener('keyup', (event: KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
      case 'Spacebar':
      case ' ':
        onEnterOrSpacebar(event);
        return;
      // no default
    }
  }, true);

  /**
   * Updated target containing tap support.
   */
  const tapTarget = target as Global & TapSupport;
  tapTarget.ontap = null;
  tapTarget.ontapstart = null;
  tapTarget.ontapend = null;
};

applyEvent(global);
