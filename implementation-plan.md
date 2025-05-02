# Trade Entry Implementation Plan

## Current Status
- Basic trade entry form implemented with required fields
- UI components (toast, calendar, popover) installed
- Form validation working
- Live risk/reward calculations implemented
- Authentication issues preventing trade saving
- Styling needs improvement

## Implementation Plan

### 1. Fix Authentication (Priority: High)
- [ ] Review current auth flow in `lib/supabase/client.ts` and `lib/supabase/server.ts`
- [ ] Implement proper session handling
- [ ] Add auth middleware to protect routes
- [ ] Test auth flow end-to-end
- [ ] Verify trade creation with authenticated user

### 2. Enhance TradeForm UI/UX (Priority: Medium)
- [ ] Improve form layout and spacing
  - Better field grouping
  - Consistent spacing between sections
  - Proper alignment of labels and inputs
- [ ] Add loading states
- [ ] Enhance validation feedback
  - Clear error messages
  - Visual indicators for valid/invalid fields
- [ ] Style risk/reward panel
  - Card-based layout
  - Clear value presentation
  - Visual indicators for good/bad R:R ratios
- [ ] Implement responsive design
  - Stack fields on mobile
  - Adjust spacing for different screen sizes
  - Ensure modal works well on all devices

### 3. Implement Partial Closures (Priority: High)
- [ ] Create ClosureModal component
  - Fields: closure date, quantity, price, fees
  - Validation to prevent closing more than available
- [ ] Add closure tracking logic
  - Track remaining open quantity
  - Calculate realized/unrealized P/L
  - Update trade status based on closures
- [ ] Implement closure management
  - Edit existing closures
  - Delete closures
  - Recalculate trade state on closure changes

### 4. Centralize Calculations (Priority: Medium)
- [ ] Create utility functions for calculations
  - Risk per unit & total risk
  - Reward per unit & total reward
  - R-multiple
  - Realized/unrealized P/L
- [ ] Store calculated values in database
  - Update schema if needed
  - Add database triggers for recalculation
- [ ] Ensure consistent display
  - Use stored values across UI
  - Update only when inputs change
  - Add proper formatting

## Success Criteria
1. Users can successfully authenticate and save trades
2. Form is visually appealing and easy to use
3. Partial closures work correctly and maintain trade state
4. Calculations are consistent across the application
5. All functionality works on both desktop and mobile

## Next Steps
1. Begin with authentication fix to enable basic trade saving
2. Move on to UI enhancements once core functionality works
3. Implement partial closures after basic trade management is solid
4. Finally, optimize calculations and ensure consistency

*Note: This plan will be updated as we progress and discover new requirements or challenges.*