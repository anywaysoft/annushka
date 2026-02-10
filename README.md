### Annushka

'Annushka has already spilled the oil, so your meeting cannot happen' - Is what Woland told Berlioz in Bullgakov's Master and Margarita. 

Just in case you don't know what I am talking about, Annushka has spilled her oil on a tramway, that Berlioz was going to cross in a few 
minutes. He would slip and fall, get his head cut off by an oncoming tram, and die, so his meeting would never happen. 

Woland's point was that ‘Yes, man is mortal, but that would be only half the trouble. The worst
of it is that he’s sometimes unexpectedly mortal - there’s the trick!'

Ever thought what would happen if it happened to you? Not a pleasant thought, I know, but still ... would there be anything you wish you 
told people while you still could. Maybe, it's just your life insurance policy number, or a long-overdue confession you never had the guts 
to make ... 

With this little app, and just a little bit of preparation you can: make a (private) google doc in your account, and put the info you want 
shared in case of that unfortunate even there. Then add Annushka to your workspace (see below). That's it. Annushka will run daily checking 
if you are still around, and when you seem to disappear for a while, it will share the doc you gave it with the people you designate, and send 
an email to let them know. That's it, you get to reach out to them from beyond the grave with one last message. Make it count. 

### How it works 

Annushka will run daily and check the email timestamps in your account (just the timestamps, never the contents or any other data). Its purpose 
is to determine if you have used your account fairly recently. Google makes it (unsurprisingly) difficult for the app-script to spy after user's activity 
in the account, so Annushka has to get a little inventive. It will check for the most recent emails in your inbox to see if any of them got either read or 
deleted.  It cannot tell WHEN you have deleted (or read) an email, only when it was _received_. But that should be a good enough proxy, unless you 
have a habit to only act on emails that were received weeks earlier, and ignore all the recent once whenever you use your gmail. 

So, Annushka checks the latest of the two timestamps - the most recent email read and the most recent email deleted - as a proxy to your "most recent 
activity". If this timestamp is newer than a week, that must mean you are still around, so Annushka does not do anything (except for sending you an email 
with the status - just so you know it's still watching out for you). 
If you have not been "active" for more than 7 days, that's a possible cause for a concern. Annushka will send an email to you to remind you that you 
need to _do something_ with your email account if you are still around. You just need to click on that email (or on any other), or delete it for 
Annushka to go back to dormant mode. 

But *if you don't*, and more than 10 days of inactivity go by, Annushka will _activate_. On day 11, if will share your doc with the people you 
have specified in the settings (see below), and send an email to each of them with the link. So, if something has really happened to you, they 
will have a chance to get this info you wish you had communicated to them, but never did. Or, if you are ok, and just haven't been using your email 
for a while ... well, the secrets you were keeping from your loved ones are no longer safe. You should pay attention to those "action required" warnings, 
there will be three of them. 

All the time thresholds are confirgurable, of course. If you don't use gmail all that frequently, you can always bump the threshold to a month or something.
Just don't make it so longer people no longer remember who you are when they finally get your doc. 

### Set it up

There are two ways to get Annushka watch after you. You can set it up in your gmail account as a standalone app-script, or you can use a workspace add-on. 

If you are looking at a github repo, and "app-script" means something to you, the former approach is probably easier and more appealing to you.
 If not, simply find Annushka in the [marketplace](https://workspace.google.com/u/0/marketplace) and follow the instructions to install and authorize the add-on. It will ask you for various scary permissions (like full access to your GDrive), I need those for things like sharing your doc with people you want. 
Annushka will never touch anything on your drive (or in your email, or anywhere else), except for sharing the one document you explicitly specify with 
the accounts you give it, or look at any contents of anything, except for the timestamps of your deleted or read emails. 

To set this up as a script in your account, look at [README](script/README.md) under the script folder, and follow the instructions. It is fairly 
straitforward, and less scary, because you own the entire installation, including the source code, so you KNOW it is not stealing any of your data or anything like that. 
