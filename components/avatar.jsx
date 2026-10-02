export function AuthorAvatar({ author }) {
  return (
    <div class="avatar">
      <div class="quote__avatar-img avatar__img">
        {author.avatar ? (
          <img src={author.avatar} alt={author.name} loading="lazy" />
        ) : null}
      </div>
      <div class="avatar__meta">
        <div class="avatar__title">{author.name}</div>
        <div class="avatar__description">{author.spec}</div>
      </div>
    </div>
  );
}
