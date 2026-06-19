"use client";

import { MonitorIcon, MoonIcon, SettingsIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { locales, type Locale } from "@/lib/i18n/settings";
import { cn } from "@/lib/utils";

const themeIcons = {
  light: SunIcon,
  dark: MoonIcon,
  system: MonitorIcon,
} as const;

const themeLabelKeys = {
  light: "settings.themeLight",
  dark: "settings.themeDark",
  system: "settings.themeSystem",
} as const;

type SettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResetAllData?: () => Promise<boolean>;
};

function SettingsOptionButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      className={cn("justify-start gap-2", active && "border-primary bg-accent")}
    >
      {children}
    </Button>
  );
}

export function SettingsDialog({
  open,
  onOpenChange,
  onResetAllData,
}: SettingsDialogProps) {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function changeLanguage(locale: Locale) {
    void i18n.changeLanguage(locale);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("settings.title")}</DialogTitle>
          <DialogDescription>{t("settings.description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <section className="space-y-2">
            <h3 className="text-sm font-medium">{t("settings.appearance")}</h3>
            <p className="text-xs text-muted-foreground">{t("settings.theme")}</p>
            <div className="grid grid-cols-3 gap-2">
              {(["light", "dark", "system"] as const).map((option) => {
                const Icon = themeIcons[option];

                return (
                  <SettingsOptionButton
                    key={option}
                    active={mounted && theme === option}
                    onClick={() => setTheme(option)}
                  >
                    <Icon className="size-4" />
                    {t(themeLabelKeys[option])}
                  </SettingsOptionButton>
                );
              })}
            </div>
          </section>

          <Separator />

          <section className="space-y-2">
            <h3 className="text-sm font-medium">{t("settings.language")}</h3>
            <div className="grid grid-cols-2 gap-2">
              {locales.map((locale) => (
                <SettingsOptionButton
                  key={locale}
                  active={i18n.language === locale}
                  onClick={() => changeLanguage(locale)}
                >
                  {t(`language.${locale}`)}
                </SettingsOptionButton>
              ))}
            </div>
          </section>

          {onResetAllData ? (
            <>
              <Separator />
              <section className="space-y-2">
                <h3 className="text-sm font-medium">{t("settings.data")}</h3>
                <p className="text-xs text-muted-foreground">
                  {t("settings.resetDescription")}
                </p>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={isResetting}
                  onClick={() => {
                    if (!window.confirm(t("settings.resetConfirm"))) {
                      return;
                    }

                    setIsResetting(true);
                    void onResetAllData()
                      .then((success) => {
                        if (success) {
                          onOpenChange(false);
                        }
                      })
                      .finally(() => {
                        setIsResetting(false);
                      });
                  }}
                >
                  {isResetting
                    ? t("settings.resetting")
                    : t("settings.resetAllData")}
                </Button>
              </section>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function SettingsButton({
  onResetAllData,
}: {
  onResetAllData?: () => Promise<boolean>;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setOpen(true)}
      >
        <SettingsIcon />
        <span className="sr-only">{t("settings.openSettings")}</span>
      </Button>
      <SettingsDialog
        open={open}
        onOpenChange={setOpen}
        onResetAllData={onResetAllData}
      />
    </>
  );
}
