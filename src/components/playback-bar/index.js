import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import { Button, Dropdown, DropdownItem, Icon } from 'nr1';

import { TimeRangePicker } from '@newrelic/nr-labs-components';
import { uuid } from '../../utils';
import { SHORT_DATETIME_FORMATTER, STATUSES } from '../../constants';

const playbackIncrementOptions = [
  { display: '1 minute', timeInMs: 60000 },
  { display: '5 minutes', timeInMs: 300000 },
  { display: '15 minutes', timeInMs: 900000 },
  { display: '30 minutes', timeInMs: 1800000 },
  { display: '60 minutes', timeInMs: 3600000 },
];

const playbackIncrementForSelectedDuration = ({ duration } = {}) => {
  if (!duration || duration <= 3600000) return playbackIncrementOptions[0];
  if (duration <= 21600000) return playbackIncrementOptions[1];
  if (duration <= 86400000) return playbackIncrementOptions[2];
  if (duration <= 259200000) return playbackIncrementOptions[3];
  return playbackIncrementOptions[4];
};

const isPlaybackIncrementDisabled = ({ timeInMs } = {}, timeRange = {}) => {
  const duration = durationFromTimeRange(timeRange);
  if (!timeInMs || !duration || timeInMs > duration) return true;
  if (timeInMs === 60000 && duration > 3600000) return true;
  if (timeInMs === 300000 && duration > 21600000) return true;
  if (timeInMs === 900000 && duration > 86400000) return true;
  if (timeInMs === 1800000 && duration > 259200000) return true;
  return false;
};

const durationFromTimeRange = (timeRange = {}) =>
  timeRange.duration || timeRange.end_time - timeRange.begin_time || 0;

const widthPerBand = (trackWidth = 0, numBandsOnTrack = 1) =>
  trackWidth / numBandsOnTrack;

const timesForTimeBand = (firstBandStartTime, timeBandDurationMs, index) => {
  const start = firstBandStartTime + timeBandDurationMs * index;
  const end = start + timeBandDurationMs;
  return { start, end };
};

const hintDateTimeFormat = (timestamp) =>
  SHORT_DATETIME_FORMATTER.format(new Date(timestamp));

const PlaybackBar = ({ onPreload, onSeek }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [shouldLoopCheck, setShouldLoopCheck] = useState(false);
  const [selectedIncrement, setSelectedIncrement] = useState(
    playbackIncrementForSelectedDuration
  );
  const [seekerStyle, setSeekerStyle] = useState({ width: 8, left: 0 });
  const [timeRange, setTimeRange] = useState({
    begin_time: null,
    duration: 1800000,
    end_time: null,
  });
  const [timeBands, setTimeBands] = useState([]);
  const [displayBands, setDisplayBands] = useState([]);
  const [seekHintText, setSeekHintText] = useState('');
  const seek = useRef();
  const intervalId = useRef();
  const shouldLoop = useRef(false);
  const seekX = useRef(0);
  const seekBandsCount = useRef(0);
  const seekBandWidth = useRef(0);
  const seekDragStartX = useRef(0);
  const isMouseDownOnSeeker = useRef(false);
  const showingTimeWindow = useRef({ start: 0, end: 0 });

  const loadDataCache = useCallback(async (tbs) => {
    if (!onPreload) return;
    await onPreload(tbs, (idx, status) =>
      setDisplayBands((dbs) =>
        dbs.map((db, i) => (i === idx ? { ...db, status } : db))
      )
    );
  }, []);

  const redrawBands = useCallback(() => {
    if (seekBandsCount.current && seekBandWidth.current) {
      const width = seekBandWidth.current;
      setDisplayBands(
        Array.from({ length: seekBandsCount.current }, (_, i) => ({
          key: uuid(),
          style: { left: i * width, width },
        }))
      );
      const newSeekX = Math.round(seekX.current / width) * width;
      seekX.current = newSeekX;
      setSeekerStyle((sty) => ({
        ...sty,
        width,
        transform: `translateX(${newSeekX}px)`,
      }));
    }
  }, []);

  const mouseDownHandler = useCallback((e) => {
    isMouseDownOnSeeker.current = true;
    seekDragStartX.current = e.clientX;
  }, []);

  const timeRangeChangeHandler = useCallback((selectedTimeRange) => {
    setTimeRange(selectedTimeRange);
    setSelectedIncrement(
      playbackIncrementForSelectedDuration(selectedTimeRange)
    );
  }, []);

  useEffect(() => {
    const mouseUpHandler = () => {
      isMouseDownOnSeeker.current = false;
      setSeekerStyle((sty) => ({ ...sty, cursor: 'grab' }));
    };
    const mouseMoveHandler = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (isMouseDownOnSeeker.current) {
        setIsPlaying(false);
        const { left: minX = 0, width = 0 } =
          seek.current?.getBoundingClientRect() || {};
        const maxX = width + minX;
        let cursorPosPct = ((e.clientX - minX) / (maxX - minX)) * 100;
        if (cursorPosPct < 0) cursorPosPct = 0;
        if (cursorPosPct > 100) cursorPosPct = 100;
        const trackUsableWidth = width - seekBandWidth.current;
        const pos = (cursorPosPct / 100) * trackUsableWidth;
        const left =
          Math.round(pos / seekBandWidth.current) * seekBandWidth.current;
        seekX.current = left;
        setSeekerStyle((sty) => ({
          ...sty,
          transform: `translateX(${left}px)`,
        }));
      }
    };
    const seekResizeObserver = new ResizeObserver(
      ([{ contentRect: { width } = {} }] = [{}]) => {
        const bandWidth = widthPerBand(width, seekBandsCount.current);
        seekBandWidth.current = bandWidth;
        setSeekerStyle((sty) => ({ ...sty, width: bandWidth }));
        redrawBands();
      }
    );
    document.addEventListener('mouseup', mouseUpHandler, true);
    document.addEventListener('mousemove', mouseMoveHandler, true);
    seekResizeObserver.observe(seek.current);

    return () => {
      document.removeEventListener('mouseup', mouseUpHandler, true);
      document.removeEventListener('mousemove', mouseMoveHandler, true);
      seekResizeObserver.unobserve(seek.current);
    };
  }, []);

  useEffect(() => {
    if (isPlaying) {
      intervalId.current = setInterval(() => {
        setSeekerStyle((sty) => {
          let newX = seekX.current + seekBandWidth.current;
          if (newX + seekBandWidth.current > seek.current.offsetWidth)
            newX = shouldLoop.current ? 0 : seekX.current;
          seekX.current = newX;
          return {
            ...sty,
            transform: `translateX(${newX}px)`,
          };
        });
      }, 3000);
    } else {
      clearInterval(intervalId.current);
    }

    () => clearInterval(intervalId.current);
  }, [isPlaying]);

  useEffect(() => {
    if (isMouseDownOnSeeker.current) return;
    const bandIndex = Math.round(seekX.current / seekBandWidth.current);
    const { start, end } = timeBands[bandIndex] || {};
    if (
      start &&
      end &&
      start !== showingTimeWindow.current.start &&
      end !== showingTimeWindow.current.end
    ) {
      showingTimeWindow.current = { start, end };
      setSeekHintText(
        `${hintDateTimeFormat(start)} - ${hintDateTimeFormat(end)}`
      );
      if (onSeek) onSeek(showingTimeWindow.current);
    }
  }, [seekerStyle, timeBands]);

  useEffect(() => {
    setIsPlaying(false);
    const duration = durationFromTimeRange(timeRange);
    const playheadIncrement = selectedIncrement.timeInMs;
    const numBands = Math.round(duration / playheadIncrement);
    seekBandsCount.current = numBands;
    const bandWidth = widthPerBand(seek.current.offsetWidth, numBands);
    seekBandWidth.current = bandWidth;
    const firstBandStartTime =
      (timeRange.begin_time || Date.now()) - timeRange.duration;
    const tbs = Array.from({ length: numBands }, (_, i) =>
      timesForTimeBand(firstBandStartTime, selectedIncrement.timeInMs, i)
    );
    setTimeBands(tbs);
    redrawBands();
    loadDataCache(tbs);
  }, [selectedIncrement, timeRange]);

  return (
    <div className="playback-bar">
      <TimeRangePicker
        timeRange={timeRange}
        onChange={timeRangeChangeHandler}
      />
      <Dropdown
        className="playback-settings"
        iconType={Dropdown.ICON_TYPE.INTERFACE__OPERATIONS__CONFIGURE}
      >
        <DropdownItem items={playbackIncrementOptions}>
          <div className="playback-setting">
            <span className="setting-name">Playhead increment</span>
            <span className="setting-value">{selectedIncrement.display}</span>
          </div>
          {({ item }) => (
            <DropdownItem
              key={item.timeInSeconds}
              disabled={isPlaybackIncrementDisabled(item, timeRange)}
              onClick={() => setSelectedIncrement(item)}
            >
              {item.display}
            </DropdownItem>
          )}
        </DropdownItem>
        <DropdownItem
          onClick={() =>
            setShouldLoopCheck((slc) => (shouldLoop.current = !slc) && !slc)
          }
        >
          <div className="playback-setting">
            <span className="setting-name">Loop</span>
            <span className="setting-value">
              {shouldLoopCheck ? (
                <Icon type={Icon.TYPE.INTERFACE__SIGN__CHECKMARK} />
              ) : (
                <span className="loop-blank" />
              )}
            </span>
          </div>
        </DropdownItem>
      </Dropdown>
      <Button
        variant={Button.VARIANT.PRIMARY}
        sizeType={Button.SIZE_TYPE.SMALL}
        iconType={
          isPlaying
            ? Button.ICON_TYPE.INTERFACE__OPERATIONS__PAUSE
            : Button.ICON_TYPE.INTERFACE__OPERATIONS__PLAY
        }
        ariaLabel="Toggle playback"
        onClick={() => setIsPlaying((p) => !p)}
      />
      <div className="seek" ref={seek}>
        <div className="seek-hint">{seekHintText}</div>
        <div className="bands">
          {displayBands.map(({ key, status, style }) => (
            <div
              key={key}
              className={`band ${status || STATUSES.UNKNOWN}`}
              style={style}
            />
          ))}
        </div>
        <span
          className="seeker"
          onMouseDown={mouseDownHandler}
          style={seekerStyle}
        />
      </div>
    </div>
  );
};

PlaybackBar.propTypes = {
  onPreload: PropTypes.func,
  onSeek: PropTypes.func,
};

export default PlaybackBar;
