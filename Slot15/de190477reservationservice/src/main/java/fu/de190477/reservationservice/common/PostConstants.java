package fu.de190477.reservationservice.common;

public final class PostConstants {

    private PostConstants() {
    }

    public static final String DRAFT = "DRAFT";
    public static final String SCHEDULED = "SCHEDULED";
    public static final String PUBLISHED = "PUBLISHED";
    public static final String CANCELLED = "CANCELLED";

    public static final String STATUS_REGEX = "DRAFT|SCHEDULED|PUBLISHED|CANCELLED";

    // Room status expected from RoomService
    public static final String ROOM_AVAILABLE = "AVAILABLE";
}

