export class Queue
{
    private slots: boolean[] = [];

    constructor(private totalSlots: number)
    {
        this.initializeSlots();
    }

    private initializeSlots()
    {
        for (let i = 0; i < this.totalSlots; i++)
        {
            this.slots.push(true); // Initially, all slots are open
        }
    }

    private occupySlot(): number
    {
        const availableSlotIndex = this.slots.findIndex((slot) => slot);

        if (availableSlotIndex !== -1)
        {
            this.slots[availableSlotIndex] = false; // Occupy the slot
            setTimeout(() =>
            {
                this.releaseSlot(availableSlotIndex);
            }, 3500); // Release the slot after 3.5 seconds
            return availableSlotIndex;
        }

        return -1; // No available slots
    }

    private releaseSlot(slotIndex: number)
    {
        this.slots[slotIndex] = true; // Mark the slot as open
    }

    public runFunction(): number
    {
        const slotIndex = this.occupySlot();

        if (slotIndex !== -1)
        {
            console.log(`Function is running on slot ${slotIndex}`);
        } else
        {
            console.log('No available slots. Please try again later.');
        }

        return slotIndex;
    }
}