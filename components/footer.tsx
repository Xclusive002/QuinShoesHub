import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-background border-t border-border mt-20 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <img src="/images/logo.png" alt="Quinn Shoes Hub" className="h-12 w-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-4">Elevate your everyday walk</p>
            <p className="text-xs text-muted-foreground">Premium handcrafted shoes for the discerning individual.</p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-display font-bold text-sm mb-4 tracking-wide">SHOP</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/shop" className="text-muted-foreground hover:underline">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/shop?category=sneakers" className="text-muted-foreground hover:underline">
                  Sneakers
                </Link>
              </li>
              <li>
                <Link href="/shop?category=formal" className="text-muted-foreground hover:underline">
                  Formal
                </Link>
              </li>
              <li>
                <Link href="/shop?category=boots" className="text-muted-foreground hover:underline">
                  Boots
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display font-bold text-sm mb-4 tracking-wide">COMPANY</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-muted-foreground hover:underline">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:underline">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:underline">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:underline">
                  Returns
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display font-bold text-sm mb-4 tracking-wide">SUPPORT</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://wa.me/2348062622541"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:underline"
                >
                  WhatsApp: +234 806 262 2541
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/quinnshoeshub.ng"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:underline"
                >
                  @quinnshoeshub.ng
                </a>
              </li>
              <li>
                <p className="text-muted-foreground">help@quinnshoeshub.ng</p>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground">
            <p>&copy; 2026 Quinn Shoes Hub. All rights reserved.</p>
            <div className="flex gap-6 mt-4 sm:mt-0">
              <Link href="#" className="hover:underline">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:underline">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
