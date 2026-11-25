export function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

// Swept vertical landing check prevents the player from tunnelling through platforms.
export function resolvePlatformCollisions(player, platforms, oldY) {
  const previousBottom = oldY + player.h;
  const currentBottom = player.y + player.h;
  if (player.vy >= 0) {
    for (const p of platforms) {
      const horizontal = player.x + player.w > p.x && player.x < p.x + p.w;
      if (horizontal && previousBottom <= p.y + 2 && currentBottom >= p.y) {
        player.y = p.y - player.h;
        player.vy = 0;
        player.grounded = true;
      }
    }
  }
  for (const p of platforms) {
    if (!overlaps(player, p)) continue;
    const oldRight = player.prevX + player.w, oldLeft = player.prevX;
    if (oldRight <= p.x + 2 && player.x + player.w > p.x) player.x = p.x - player.w;
    else if (oldLeft >= p.x + p.w - 2 && player.x < p.x + p.w) player.x = p.x + p.w;
  }
}