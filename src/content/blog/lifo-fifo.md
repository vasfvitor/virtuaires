---
title: "Round-robin, FIFO, LIFO"
description: "A bit about queueing"
pubDate: "Aug 03 2023"
heroImage: "/src/assets/images/bg-2.png"
---

# bada bing bada boom

Imagine you go into a restaurant and make an order. Then another person arrives and makes an order, then another... Now let's look at the kitchen. The waiter goes and leaves each order. How would be the right way to the kitchen to serve? Clearly, the first person in the queue must be served first, right? Sure, that's FIFO, First In First Out.

## bada bing bada boom?

I just like how it sounds. Now back at the kitchen, time to do the dishes, they are all piled up... in a stack... Plates keep piling up and you keep washing them, the bottom blate is going to be there a long time until you can catch up speed and wash everything.

## And who is Robin?

So, cooker Robin is there, frying patties. Let's say he puts 5 patties in the frying pan, then he will surely go around one by one until all of them are done. There's no specific order. The frying pan is wide and he can attend each one equally until they are done. Some may be done faster, then another goes in, then... you see where this will go. So yeah, that's Round-robin.

## Are you talking about code?

Yes, a queue is a FIFO data structure. a stack is a LIFO data structure and a Round-robin is a circular queue. But why do we care about it? Most of high level languages we don't ever care about it. Some things only become important at scale.


