import Link from "next/link";
import React from "react";
import { siteConfig, getFullAddress, getCopyrightText } from "@aotf/config";
import type { Route } from "next";

const Footer = () => {
  return (
    <footer className="m-auto px-8 mb-20 sm:mb-0 container w-full text-zinc-900">
      <div className="flex flex-col md:flex-row justify-between w-full gap-10 border-b border-gray-500 pb-10">
        <div className="md:max-w-96">
          <h3 className="text-xl font-bold text-primary">{siteConfig.name}</h3>
          <p className="mt-6 text-sm">{siteConfig.description}</p>

          {/* Social Media Links */}
          {/* <div className="flex items-center gap-4 mt-4">
            {Object.entries(siteConfig.social).map(([platform, url]) => (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <span className="capitalize">{platform}</span>
              </a>
            ))}
          </div> */}
        </div>

        <div className="flex-1 flex flex-col md:flex-row items-start md:justify-end gap-5 md:gap-20">
          <div>
            <h2 className="font-semibold mb-5 ">Quick Links</h2>
            <ul className="text-sm space-y-2">
              {siteConfig.footer.quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href as Route}
                    className="hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-semibold mb-5 ">Get in touch</h2>
            <div className="text-sm space-y-2">
              <p>{getFullAddress()}</p>
              <Link
                href={`tel:${siteConfig.contact.phone}`}
              >
               <p>{siteConfig.contact.phone}</p>
              </Link>
              <Link
                href={`mailto:${siteConfig.contact.email}`}
              >
               <p>{siteConfig.contact.email}</p>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 text-center text-sm pb-5">
        <p>{getCopyrightText()}</p>
        {/* <p className="mt-2 text-xs text-muted-foreground">
          {siteConfig.business.registrationNumber} |{" "}
          {siteConfig.business.panNumber}
        </p> */}
      </div>
    </footer>
  );
};

export default Footer;
