import './styles.scss';

import '@babel/polyfill';
import videojs from 'video.js';
import videojsErrors from 'videojs-errors/dist/videojs-errors.es';

// @todo - import fontawesome
import $ from 'jquery';

import clspUtils from '~root/src/js/utils';
import clspPlugin from '~root/src/js/plugin';

function displayVersions () {
  document.title = `v${clspUtils.version} ${document.title}`;

  const pageTitle = $('#page-title').html();
  $('#page-title').html(`${pageTitle} <br /> v${clspUtils.version}`);

  $('#videojs-version').html(videojs.VERSION);
  $('#videojs-errors-version').html(videojsErrors.VERSION);
}

function registerHandlers () {
  window.onPlay = function onPlay () {
    if (!window.player) {
      return;
    }

    window.player.play();
  };

  window.onStop = function onStop () {
    if (!window.player) {
      return;
    }

    // We use a custom event here because the pause event is not a viable
    // option
    window.player.trigger('stop');
  };

  window.onFullscreen = function onFullscreen () {
    if (!window.player) {
      return;
    }

    window.player.requestFullscreen();
  };

  window.onDestroy = function onDestroy () {
    if (!window.player) {
      return;
    }

    window.player.dispose();
    window.player = null;
  };
}

async function main () {
  clspPlugin().register();

  const videoElementId = 'my-video';
  const sources = $(`#${videoElementId}`)
    .find('source')
    .map(function () {
      return {
        src: this.getAttribute('src'),
        type: this.getAttribute('type'),
      };
    })
    .get();

  window.player = videojs(videoElementId, {
    autoplay: true,
    muted: true,
    preload: 'auto',
    controls: false,
    sources,
  });

  if (clspUtils.supported()) {
    window.player.clsp();
  }
}

$(() => {
  window.HELP_IMPROVE_VIDEOJS = false;
  displayVersions();
  registerHandlers();
  main();
});
