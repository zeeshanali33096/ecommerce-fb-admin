module.exports = function getTime(hours, minutes, offset) {
  let off = offset;
  let h = hours;
  let m = minutes;

  if (off > 0) {
    while (off >= 0) {
      m = m - 1;
      if (m === -1) {
        m = 59;
        h = h - 1;
      }
      if (h === -1) {
        h = 23;
      }
      off = off - 1;
    }
    return {
      h,
      m,
    };
  } else if (off < 0) {
    while (off <= 0) {
      m = m + 1;
      if (m === 60) {
        m = 0;
        h = h + 1;
      }
      if (h === 24) {
        h = 0;
      }
      off = off + 1;
    }
    return {
      h,
      m,
    };
  } else {
    return {
      h,
      m,
    };
  }
};
