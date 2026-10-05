import { Icon } from "@wordpress/components";

import "./index.scss";

/**
 * Каркас панели начального состояния блока: заголовок и тело с формой
 * настроек. Конкретные поля передаются через `children`, поэтому компонент
 * не зависит от конкретного блока.
 *
 * @param {Object}         props
 * @param {string}         props.title    - Заголовок блока.
 * @param {string|Element} props.icon     - Иконка в заголовке (опционально).
 * @param {string}         props.hint     - Подпись под заголовком (опционально).
 * @param {import("react").ReactNode} props.children - Содержимое формы.
 * @return {import("react").JSX.Element}
 */
export function BlockSetupPanel({ title, icon, hint = "", children }) {
  return (
    <div className="b-setup">
      <div className="b-setup__header">
        {icon && <Icon className="b-setup__icon" icon={icon} />}
        <span className="b-setup__title">{title}</span>
      </div>
      {hint && <p className="b-setup__hint">{hint}</p>}
      <div className="b-setup__body">{children}</div>
    </div>
  );
}
