import { Picture } from "./picture";

export function AuthorAvatar({ author }) {
	const avatar = author.images.avatar;

	return (
		<div class="avatar">
			<div class="quote__avatar-img avatar__img">
				<Picture picture={avatar} alt={author.bio.name} />
			</div>
			<div class="avatar__meta">
				<div class="avatar__title">{author.bio.name}</div>
				<div class="avatar__description">{author.specialization}</div>
			</div>
		</div>
	);
}
