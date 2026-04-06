import "./PageHeader.scss";

interface PageHeaderProps {
    eyebrow: string;
    title: string;
    subtitle?: string;
    variant?: "default" | "gold" | "dark" | "gradient" | "elegant" | "minimal";
    backgroundImage?: string;
}

const PageHeader = ({
    eyebrow,
    title,
    subtitle,
    variant = "default",
    backgroundImage,
}: PageHeaderProps) => {
    return (
        <header className={`page-header page-header--${variant}`}>
            {backgroundImage && (
                <div
                    className="page-header__bg"
                    style={{ backgroundImage: `url(${backgroundImage})` }}
                />
            )}
            <div className="page-header__overlay" />
            <div className="page-header__pattern" />
            <div className="page-header__content section">
                <p className="page-header__eyebrow">{eyebrow}</p>
                <h1 className="page-header__title">{title}</h1>
                {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
                <div className="page-header__accent" />
            </div>
        </header>
    );
};

export default PageHeader;
