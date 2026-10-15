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
        <div className="b-setup__heading">
          {icon && <Icon className="b-setup__icon" icon={icon} />}
          <span className="b-setup__title">{title}</span>
        </div>
        {hint && <p className="b-setup__hint">{hint}</p>}
      </div>
      <div className="b-setup__body">{children}</div>
    </div>
  );
}

/**
 * Секция внутри тела панели: заголовок и слот с контролом.
 *
 * @param {Object}                    props
 * @param {string}                    props.title    - Заголовок секции.
 * @param {import("react").ReactNode} props.children - Содержимое секции.
 * @return {import("react").JSX.Element}
 */
export function BlockSetupSection({ title, children }) {
  return (
    <div className="b-setup__section">
      {title && <div className="b-setup__section-title">{title}</div>}
      {children}
    </div>
  );
}

/**
 * Разделитель альтернативных опций в теле панели.
 *
 * @param {Object} props
 * @param {string} props.label - Текст разделителя.
 * @return {import("react").JSX.Element}
 */
export function BlockSetupDivider({ label = "или" }) {
  return <div className="b-setup__divider">{label}</div>;
}
