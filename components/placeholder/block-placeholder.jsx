import { isEmpty } from "@/lib/helpers/object";

import "./index.scss";

export function BlockPlaceholder({ name, hint = "" }) {
  const description = !isEmpty(hint) ? hint : "Нажимте для настройки...";

  return (
    <div className="b-placeholder">
      <div className="b-placeholder__name">{name}</div>
      <div className="b-placeholder__subname">{description}</div>
    </div>
  );
}
