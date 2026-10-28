package fu.se123456.userservice.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class users {
    @Id
    @Column
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column
    private String username;
    @Column
    private String password;

    @Column
    private String email;

    @Column
    private String phone;
}
