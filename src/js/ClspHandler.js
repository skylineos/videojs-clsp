// NOTE: This is configured as an external library by webpack, so the caller
// must provide videojs on `window`
import videojs from 'video.js';
import {
  v4 as uuidv4,
} from 'uuid';
import IovCollection from '@skylineos/clsp-player/src/js/iov/IovCollection';

import utils from './utils';

const Component = videojs.getComponent('Component');

const DEFAULT_CHANGE_SOURCE_MAX_WAIT = 5;

export default class ClspHandler extends Component {
  constructor (
    source,
    tech,
    options,
  ) {
    super(tech, options.clsp);

    this.logger = utils.Logger().factory('ClspHandler');

    this.logger.debug('constructor');

    this.tech_ = tech;
    this.source_ = source;

    // @todo - is there a better way to do this where we don't pollute the
    // top level namespace?
    this.changeSourceMaxWait = (options.changeSourceMaxWait || DEFAULT_CHANGE_SOURCE_MAX_WAIT) * 1000;
    this.iov = null;
    this.player = null;
  }

  onChangeSource = (event, {
    url,
  }) => {
    this.logger.debug(`changeSource on player "${this.id}""`);

    if (!url) {
      throw new Error('Unable to change source because there is no url!');
    }

    this.iov.changeSrc(url);
  };

  async createIov (player) {
    this.logger.debug('createIov');

    this.player = player;

    const videoId = `clsp-video-${uuidv4()}`;
    const videoJsVideoElement = this.player.el().firstChild;
    const videoElementParent = videoJsVideoElement.parentNode;
    const videoElementParentId = videoElementParent.id;

    // when videojs initializes the video element (or something like that),
    // it creates events and listeners on that element that it uses, however
    // these events interfere with our ability to play clsp streams.  Cloning
    // the element like this and reinserting it is a blunt instrument to remove
    // all of the videojs events so that we are in control of the player.
    const videoElement = videoJsVideoElement.cloneNode();
    videoElement.setAttribute('id', videoId);

    videoElementParent.insertBefore(videoElement, videoJsVideoElement);

    const collection = IovCollection.asSingleton();

    const iov = await collection.create({
      videoElement: videoJsVideoElement,
      videoElementId: videoId,
      containerElement: videoElementParent,
      containerElementId: videoElementParentId,
    });

    // It is unclear why "this.player.on('ready', () => {})" is not working;
    // however, "this.player.ready()" has worked consistently without any issue
    this.player.ready(() => {
      if (this.onReadyAlreadyCalled) {
        this.logger.warn('tried to use this player more than once...');
        return;
      }

      this.onReadyAlreadyCalled = true;

      const videoTag = this.player.children()[0];

      iov.on('firstFrameShown', () => {
        this.player.trigger('firstFrameShown');

        videoTag.style.display = 'none';
      });

      iov.on('videoReceived', () => {
        // reset the timeout monitor from videojs-errors
        this.player.trigger('timeupdate');
      });

      iov.on('videoInfoReceived', () => {
        // reset the timeout monitor from videojs-errors
        this.player.trigger('timeupdate');
      });

      this.player.on('changesrc', this.onChangeSource);
    });

    this.updateIov(iov);

    // @todo - is this functionality needed?  if not, remove this commented
    // block.  also, this particular event is on the iovPlayer, not the iov
    // this.iov.on('unsupportedMimeCodec', (error) => {
    //   this.videoPlayer.errors.extend({
    //     PLAYER_ERR_Iov: {
    //       headline: 'Error Playing Stream',
    //       message: error,
    //     },
    //   });

    //   this.videoPlayer.error({
    //     code: 'PLAYER_ERR_Iov',
    //   });
    // });
  }

  updateIov (iov) {
    this.logger.debug('updateIov');

    if (this.iov) {
      // If the Iov is the same, do nothing
      if (this.iov.id === iov.id) {
        return;
      }

      IovCollection.asSingleton()
        .remove(this.iov.id)
        .add(iov.id, iov);
    }

    this.iov = iov;
  }

  destroy () {
    this.logger.debug('destroy');

    if (this.destroyed) {
      return;
    }

    this.destroyed = true;

    if (this.onReadyAlreadyCalled) {
      this.player.off('changesrc', this.onChangeSource);
    }

    IovCollection.asSingleton().remove(this.iov.id);

    this.iov = null;
    this.player = null;
  }
}
